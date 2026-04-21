/**
 * 将 辅助码字典 转为 T93格式字典
 */
const dicts = {
    'ZRM-wanxiang': {
        // source: {
        //     file: 'radical_dicts/ZRM-wanxiang.dict.yaml',
        // },
        // target: {
        //     file: 'radical_dicts/ZRM-wanxiang_t93.dict.yaml',
        //     name: 'ZRM-wanxiang_t93',
        //     version: 'zzz',
        // },
    },
}
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
Object.keys(dicts).forEach(key => {
    const source = dicts[key].source;
    const target = dicts[key].target;
    const source_file = path.join(__dirname,
        '..',
        source?.file ?? `radical_dicts/${key}.dict.yaml`);
    const target_file = path.join(__dirname,
        '..',
        target?.file ?? `radical_dicts/${key}_t93.dict.yaml`);

    // 读取文件内容
    fs.readFile(source_file, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件时出错:', err);
            return;
        }

        // 按行分割文件内容
        const lines = data.split('\n');
        let start_flag = false;
        let target_lines = [];

        // 遍历每一行
        for (let line of lines) {
            // 保留原始行用于输出
            line = line.trim();
            // 检查是否找到'...'行
            if (line.trim() === '...') {
                start_flag = true;
                continue;
            }

            // 如果已经找到'...'行，则处理后续的每一行
            if (start_flag && line) {
                let parts = line.split('\t');
                let cn = parts[0];
                let en = parts[1];
                if (en && en.length == 1) {
                    target_lines.push(`${cn}\t${numbers[en.charAt(0)][0]}`);
                }
                if (en && en.length >= 2) {
                    let en1 = en.charAt(0);
                    let en2 = en.charAt(1);
                    let number = '';
                    number += numbers[en1][0];
                    number += numbers[en2][0];
                    number += (numbers[en1][1] - 1) * 3
                        + (numbers[en2][1]);
                    target_lines.push(`${cn}\t${number}`);
                }
            }
        }

        // 写入新文件
        fs.writeFile(target_file, `# Rime dictionary
# encoding: utf-8
# 

---
name: ${target?.name ?? key}
version: ${target?.version ?? 'zzz'}
...
` + target_lines.join('\n'), 'utf8', (err) => {
            if (err) {
                console.error('写入文件时出错:', err);
                return;
            }
            console.log('文件已成功写入:', target_file);
        });

        // 如果没有找到'...'行，可以给出提示
        if (!start_flag) {
            console.log('未找到省略号(...)行，文件可能不包含该标记');
        }
    });

})