import { BaseModel } from './common/base.model';
import { StudentModel } from './student.model';
import { AnswerModel } from './answer.model';
import { Component } from './component.model';

export interface PollInstanceModel extends BaseModel {
  uuid: string;
  finishedAt: Date;
  student: StudentModel;
  answers: AnswerModel[];
}

export interface PollInstance extends BaseModel {
  idCosmicLatte: string;
  uuid: string;
  name: string;
  version: string;
  finishedAt: string;
  components: Component[];
}
