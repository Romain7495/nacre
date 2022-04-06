'use strict';

const grep = (regex?: RegExp) => {
  // https://stackoverflow.com/questions/20579033/why-do-i-need-to-write-functionvalue-return-my-functionvalue-as-a-callb
  if(!regex) {
    throw Error('Regex required');
  }
  return RegExp.prototype.test.bind(regex);
}

export = grep;
