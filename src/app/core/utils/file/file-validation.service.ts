import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FileFieldConfig } from '@core/factories/forms/form-factory.interface';

@Injectable({ providedIn: 'root' })
export class FileValidationService {
  validate(
    file: File,
    currentNameFiles: (string | null)[],
    currentTotalCount: number,
    config: FileFieldConfig
  ): ValidationErrors | null {
    if (currentTotalCount >= config.maxFiles!)
      return { maxFiles: { max: config.maxFiles } };
    if (currentNameFiles.some(f => f === file.name))
      return { duplicated: { fileName: file.name } };
    if (!config.allowedMimeTypes!.includes(file.type))
      return {
        fileFormat: {
          fileName: file.name,
          extensions: config.allowedExtensions,
        },
      };
    if (file.size > config.maxSizeMb!)
      return { maxSize: { fileName: file.name, maxMb: config.maxSizeMb } };
    return null;
  }

  getMaxFilesMessage(maxFiles: number, currentCount: number): string {
    const removeCount = currentCount - maxFiles;
    return `You can only attach up to ${maxFiles} documents. Please remove ${removeCount} file(s) before saving.`;
  }
}
