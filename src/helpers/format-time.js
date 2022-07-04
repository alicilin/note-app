'use strict';
import _ from 'lodash';
function formatTime(ms) {
    let arr = [
        parseFloat((ms / 1000) / 60 / 60 % 60),
        parseFloat((ms / 1000) / 60 % 60),
        parseFloat((ms / 1000) % 60)
    ];

    return `${_.ceil(arr[0])} hours ${_.ceil(arr[1])} minutes ${_.ceil(arr[2])} seconds`;
}

export default formatTime;