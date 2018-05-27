import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripOptTags' })

export class stripOptTags implements PipeTransform {
  transform(nodeName: string): string {
    return nodeName.replace(/__opt_/g,"");
  }
}