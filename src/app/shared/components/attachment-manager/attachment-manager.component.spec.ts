import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { AttachmentManagerComponent } from './attachment-manager.component';
import { AttachmentApiService } from '@core/services/api/attachments.service';
import { AttachmentModel, StagedFile } from '@core/models/attachment.model';

describe('AttachmentManagerComponent', () => {
  let component: AttachmentManagerComponent;
  let fixture: ComponentFixture<AttachmentManagerComponent>;
  let attachmentApi: jasmine.SpyObj<AttachmentApiService>;

  beforeEach(async () => {
    attachmentApi = jasmine.createSpyObj<AttachmentApiService>(
      'AttachmentApiService',
      ['list', 'upload', 'deleteAttachment', 'createDraftSession']
    );

    await TestBed.configureTestingModule({
      imports: [AttachmentManagerComponent],
      providers: [{ provide: AttachmentApiService, useValue: attachmentApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentManagerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entityType', 'Assessment');
  });

  it('should load existing attachments when entityId exists', () => {
    const attachments: AttachmentModel[] = [
      {
        id: 1,
        entityType: 'Interventions',
        entityId: 1,
        originalFileName: 'file',
        mimeType: 'pdf',
        sizeBytes: 1050,
        contentHash: 'string',
      } as AttachmentModel,
    ];

    attachmentApi.list.and.returnValue(of(attachments));

    fixture.componentRef.setInput('entityId', 10);

    fixture.detectChanges();

    expect(attachmentApi.list).toHaveBeenCalledWith('Assessment', 10);

    expect(component.existingAttachments()).toEqual(attachments);
  });

  it('should stop loading when list fails', () => {
    attachmentApi.list.and.returnValue(throwError(() => new Error()));

    fixture.componentRef.setInput('entityId', 10);

    fixture.detectChanges();

    expect(component.isLoadingExisting()).toBeFalse();
  });

  it('should mark attachment for removal', () => {
    component.toggleRemoveExisting(1);

    expect(component.markedForRemoval().has(1)).toBeTrue();
  });

  it('should unmark attachment for removal', () => {
    component.toggleRemoveExisting(1);
    component.toggleRemoveExisting(1);

    expect(component.markedForRemoval().has(1)).toBeFalse();
  });

  it('should retry upload', () => {
    const file = new File(['content'], 'test.pdf');

    component['draftSessionId'] = 123;

    component.stagedFiles.set([
      {
        localId: '10',
        file,
        attachmentId: null,
        status: 'error',
      },
    ]);

    attachmentApi.upload.and.returnValue(of({ id: 50 } as AttachmentModel));

    component.retryUpload(component.stagedFiles()[0]);

    expect(attachmentApi.upload).toHaveBeenCalledWith('Temp', 123, [file]);

    expect(component.stagedFiles()[0].status).toBe('done');
  });

  it('should delete attachment and remove staged file', () => {
    const file = new File(['content'], 'test.pdf');

    component.stagedFiles.set([
      {
        localId: '1',
        file,
        attachmentId: 10,
        status: 'done',
      },
    ]);

    attachmentApi.deleteAttachment.and.returnValue(of(void 0));

    component.removeStaged(component.stagedFiles()[0]);

    expect(attachmentApi.deleteAttachment).toHaveBeenCalledWith(10);

    expect(component.stagedFiles().length).toBe(0);
  });

  it('should remove staged file without calling api', () => {
    const file = new File(['content'], 'test.pdf');

    component.stagedFiles.set([
      {
        localId: '1',
        file,
        attachmentId: null,
        status: 'uploading',
      },
    ]);

    component.removeStaged(component.stagedFiles()[0]);

    expect(attachmentApi.deleteAttachment).not.toHaveBeenCalled();

    expect(component.stagedFiles().length).toBe(0);
  });

  it('should return false when there is no content', () => {
    expect(component.hasAnyContent()).toBeFalse();
  });

  it('should return true when staged files exist', () => {
    component.stagedFiles.set([
      {
        localId: '1',
        file: new File(['x'], 'a.pdf'),
        attachmentId: null,
        status: 'done',
      },
    ]);

    expect(component.hasAnyContent()).toBeTrue();
  });

  it('should return true when visible attachments exist', () => {
    component.existingAttachments.set([{ id: 1 } as AttachmentModel]);

    expect(component.hasAnyContent()).toBeTrue();
  });

  it('should return pending changes', () => {
    component['draftSessionId'] = 123;

    component.toggleRemoveExisting(5);
    component.toggleRemoveExisting(10);

    const result = component.getPendingChanges();

    expect(result).toEqual({
      draftSessionId: 123,
      attachmentIdsToRemove: [5, 10],
    });
  });

  it('should not load existing attachments when entityId is null', () => {
    fixture.detectChanges();
    expect(attachmentApi.list).not.toHaveBeenCalled();
  });

  it('should set loading state while existing attachments are loading', () => {
    attachmentApi.list.and.returnValue(
      new Observable(() => {
        // Keep observable open so loading remains true.
      })
    );

    fixture.componentRef.setInput('entityId', 10);
    fixture.detectChanges();

    expect(component.isLoadingExisting()).toBeTrue();
  });

  it('should clear loading state and set existing attachments after successful load', () => {
    const attachments = [
      { id: 1 } as AttachmentModel,
      { id: 2 } as AttachmentModel,
    ];

    attachmentApi.list.and.returnValue(of(attachments));

    fixture.componentRef.setInput('entityId', 10);
    fixture.detectChanges();

    expect(component.existingAttachments()).toEqual(attachments);
    expect(component.isLoadingExisting()).toBeFalse();
  });

  it('should return only attachments not marked for removal', () => {
    component.existingAttachments.set([
      { id: 1 } as AttachmentModel,
      { id: 2 } as AttachmentModel,
      { id: 3 } as AttachmentModel,
    ]);

    component.toggleRemoveExisting(2);

    expect(component.visibleExisting()).toEqual([
      { id: 1 } as AttachmentModel,
      { id: 3 } as AttachmentModel,
    ]);
  });

  it('should return true for hasAnyContent when visible attachments exist', () => {
    component.existingAttachments.set([{ id: 1 } as AttachmentModel]);

    component.toggleRemoveExisting(1);

    expect(component.hasAnyContent()).toBeFalse();
  });

  it('should create a draft session when files are selected', () => {
    const file = new File(['content'], 'test.pdf');

    attachmentApi.createDraftSession.and.returnValue(of(123));
    attachmentApi.upload.and.returnValue(of({ id: 50 } as AttachmentModel));

    const event = {
      target: {
        files: [file],
        value: 'selected',
      },
    } as unknown as Event;

    component.onFilesSelected(event);

    expect(attachmentApi.createDraftSession).toHaveBeenCalled();
    expect(attachmentApi.upload).toHaveBeenCalledWith('Temp', 123, [file]);
  });

  it('should add a staged placeholder while draft session is being created', () => {
    const file = new File(['content'], 'test.pdf');

    attachmentApi.createDraftSession.and.returnValue(
      new Observable(() => {
        // Keep request pending.
      })
    );

    const event = {
      target: {
        files: [file],
        value: 'selected',
      },
    } as unknown as Event;

    component.onFilesSelected(event);

    expect(component.stagedFiles().length).toBe(1);
    expect(component.stagedFiles()[0].file).toBe(file);
    expect(component.stagedFiles()[0].attachmentId).toBeNull();
    expect(component.stagedFiles()[0].status).toBe('uploading');
  });

  it('should clear the file input after files are selected', () => {
    const file = new File(['content'], 'test.pdf');

    attachmentApi.createDraftSession.and.returnValue(
      new Observable(() => {
        // nullable
      })
    );

    const input = {
      files: [file],
      value: 'selected',
    } as unknown as HTMLInputElement;

    component.onFilesSelected({
      target: input,
    } as unknown as Event);

    expect(input.value).toBe('');
  });

  it('should do nothing when no files are selected', () => {
    const input = {
      files: null,
      value: '',
    } as unknown as HTMLInputElement;

    component.onFilesSelected({
      target: input,
    } as unknown as Event);

    expect(attachmentApi.createDraftSession).not.toHaveBeenCalled();
    expect(component.stagedFiles()).toEqual([]);
  });

  // it('should stage and upload multiple files after creating a draft session', () => {
  //   const file1 = new File(['one'], 'one.pdf');
  //   const file2 = new File(['two'], 'two.pdf');

  //   attachmentApi.createDraftSession.and.returnValue(of(123));

  //   attachmentApi.upload.and.callFake(
  //     (_type, _draftId, files) =>
  //       of({
  //         id: files[0] === file1 ? 101 : 102,
  //       } as AttachmentModel)
  //   );

  //   const event = {
  //     target: {
  //       files: [file1, file2],
  //       value: 'selected',
  //     },
  //   } as unknown as Event;

  //   component.onFilesSelected(event);

  //   expect(attachmentApi.createDraftSession).toHaveBeenCalledTimes(1);
  //   expect(attachmentApi.upload).toHaveBeenCalledTimes(2);

  //   expect(component.stagedFiles()).toEqual([
  //     jasmine.objectContaining({
  //       file: file1,
  //       attachmentId: 101,
  //       status: 'done',
  //     }),
  //     jasmine.objectContaining({
  //       file: file2,
  //       attachmentId: 102,
  //       status: 'done',
  //     }),
  //   ]);
  // });

  it('should mark uploaded file as done on successful upload', () => {
    const file = new File(['content'], 'test.pdf');

    component['draftSessionId'] = 123;

    attachmentApi.upload.and.returnValue(of({ id: 50 } as AttachmentModel));

    component.stagedFiles.set([
      {
        localId: '1',
        file,
        attachmentId: null,
        status: 'uploading',
      },
    ]);

    component['uploadOneFile'](file);

    expect(component.stagedFiles()[0]).toEqual(
      jasmine.objectContaining({
        file,
        attachmentId: 50,
        status: 'done',
      })
    );
  });

  it('should mark uploaded file as error when upload fails', () => {
    const file = new File(['content'], 'test.pdf');

    component['draftSessionId'] = 123;

    attachmentApi.upload.and.returnValue(
      throwError(() => new Error('upload failed'))
    );

    component.stagedFiles.set([
      {
        localId: '1',
        file,
        attachmentId: null,
        status: 'uploading',
      },
    ]);

    component['uploadOneFile'](file);

    expect(component.stagedFiles()[0].status).toBe('error');
  });

  it('should upload immediately when a draft session already exists', () => {
    const file = new File(['content'], 'test.pdf');
    component['draftSessionId'] = 123;
    attachmentApi.upload.and.returnValue(of({ id: 50 } as AttachmentModel));

    const event = {
      target: {
        files: [file],
        value: 'selected',
      },
    } as unknown as Event;

    component.onFilesSelected(event);

    expect(attachmentApi.createDraftSession).not.toHaveBeenCalled();
    expect(attachmentApi.upload).toHaveBeenCalledWith('Temp', 123, [file]);
    expect(component.stagedFiles()[0].status).toBe('done');
  });

  it('should not retry upload when there is no draft session', () => {
    const file = new File(['content'], 'test.pdf');

    const staged: StagedFile = {
      localId: '1',
      file,
      attachmentId: null,
      status: 'error',
    };

    component.stagedFiles.set([staged]);

    component.retryUpload(staged);

    expect(attachmentApi.upload).not.toHaveBeenCalled();
    expect(component.stagedFiles()[0].status).toBe('error');
  });

  it('should set staged file back to uploading before retrying', () => {
    const file = new File(['content'], 'test.pdf');

    component['draftSessionId'] = 123;

    attachmentApi.upload.and.returnValue(
      new Observable(() => {
        // Keep upload pending.
      })
    );

    const staged: StagedFile = {
      localId: '1',
      file,
      attachmentId: null,
      status: 'error',
    };

    component.stagedFiles.set([staged]);

    component.retryUpload(staged);

    expect(component.stagedFiles()[0].status).toBe('uploading');
    expect(attachmentApi.upload).toHaveBeenCalledWith('Temp', 123, [file]);
  });

  it('should return draft session id as null when no session exists', () => {
    expect(component.getPendingChanges()).toEqual({
      draftSessionId: null,
      attachmentIdsToRemove: [],
    });
  });

  it('should preserve draft session id after successful file staging', () => {
    const file = new File(['content'], 'test.pdf');

    attachmentApi.createDraftSession.and.returnValue(of(456));
    attachmentApi.upload.and.returnValue(of({ id: 99 } as AttachmentModel));

    const event = {
      target: {
        files: [file],
        value: 'selected',
      },
    } as unknown as Event;

    component.onFilesSelected(event);

    expect(component.getPendingChanges().draftSessionId).toBe(456);
  });

  it('should stage files by adding staged placeholder', () => {
    component['draftSessionId'] = null;
    component['draftSessionPending'] = true;
    const file = new File(['content'], 'test.pdf');
    spyOn(component, 'addStagedPlaceholder');
    component['stageFiles']([file]);

    expect(component['addStagedPlaceholder']).toHaveBeenCalledWith(file);
  });

  it('should return attachment ids to remove as an array', () => {
    component.toggleRemoveExisting(3);
    component.toggleRemoveExisting(7);

    const result = component.getPendingChanges();

    expect(result.attachmentIdsToRemove).toEqual([3, 7]);
  });

  it('should mark draft session as no longer pending after creation fails', () => {
    const file = new File(['content'], 'test.pdf');

    attachmentApi.createDraftSession.and.returnValue(
      throwError(() => new Error('draft failed'))
    );

    const event = {
      target: {
        files: [file],
        value: 'selected',
      },
    } as unknown as Event;

    component.onFilesSelected(event);

    expect(component['draftSessionPending']).toBeFalse();
    expect(component['draftSessionId']).toBeNull();
  });
});
