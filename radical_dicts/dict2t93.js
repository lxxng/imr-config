/**
 * 将ZRM_wanxiang.dict.yaml转为T93格式ZRM_wanxiang_t93.dict.yaml
 */
const fuma_dict = 'ZRM_wanxiang'
const numbers = {
    /**
       fn* tuw gsa
       jyk pix hde
       mzc rlq bvo
     */
    'f': [1, 1],
    'n': [1, 2],
    't': [2, 1],
    'u': [2, 2],
    'w': [2, 3],
    'g': [3, 1],
    's': [3, 2],
    'a': [3, 3],
    'j': [4, 1],
    'y': [4, 2],
    'k': [4, 3],
    'p': [5, 1],
    'i': [5, 2],
    'x': [5, 3],
    'h': [6, 1],
    'd': [6, 2],
    'e': [6, 3],
    'm': [7, 1],
    'z': [7, 2],
    'c': [7, 3],
    'r': [8, 1],
    'l': [8, 2],
    'q': [8, 3],
    'b': [9, 1],
    'v': [9, 2],
    'o': [9, 3],
}

// 读取ZRM_wanxiang.dict.yaml文件并处理
const fs = require('fs');
const path = require('path');

// 获取文件路径
const dictFilePath = path.join(__dirname, fuma_dict + '.dict.yaml');
const outputFilePath = path.join(__dirname, fuma_dict + '_t93.dict.yaml');

// 读取文件内容
fs.readFile(dictFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('读取文件时出错:', err);
        return;
    }

    // 按行分割文件内容
    const lines = data.split('\n');
    let foundEllipsis = false;
    let outputLines = [];

    // 遍历每一行
    for (let line of lines) {
        // 保留原始行用于输出
        let originalLine = line;
        line = line.trim();
        // 检查是否找到'...'行
        if (line.trim() === '...') {
            foundEllipsis = true;
            outputLines.push(originalLine);
            continue; // 跳过'...'行本身
        }

        // 如果已经找到'...'行，则处理后续的每一行
        if (foundEllipsis && line) {
            let parts = line.split('\t');
            let cn = parts[0];
            let en = parts[1];
            if (en && en.length >= 2) {
                let en1 = en.charAt(0);
                let en2 = en.charAt(1);
                let number = '';
                number += numbers[en1][0];
                number += numbers[en2][0];
                number += (numbers[en1][1] - 1) * 3
                    + (numbers[en2][1]);
                // number在这里!!
                // 将number添加到行末尾
                outputLines.push(`${cn}\t${number}`);
            } else {
                // 如果没有足够的英文字符，保持原样
                outputLines.push(originalLine);
            }
        } else {
            // 在...之前的内容保持不变
            outputLines.push(originalLine.replaceAll(fuma_dict, fuma_dict + '_t93'));
        }
    }

    // 写入新文件
    fs.writeFile(outputFilePath, outputLines.join('\n'), 'utf8', (err) => {
        if (err) {
            console.error('写入文件时出错:', err);
            return;
        }
        console.log('文件已成功写入:', outputFilePath);
    });

    // 如果没有找到'...'行，可以给出提示
    if (!foundEllipsis) {
        console.log('未找到省略号(...)行，文件可能不包含该标记');
    }
});