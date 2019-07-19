// @flow
import fs from 'fs';
import concat from 'concat-stream';
import allwords from './allwords';

const words = {
    random_words: (count) => {
        let all = allwords;
        let _w = [];
        for(var i=0;i<count;i++) {
            var word = all[Math.floor(Math.random()*all.length)];
            _w.push(word);
        }
        return _w;
    }
}


export default words;