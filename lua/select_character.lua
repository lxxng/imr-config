-- 以词定字
-- 原脚本 https://github.com/BlindingDark/rime-lua-select-character
-- 可在 default.yaml → key_binder 下配置快捷键，默认为左右中括号 [ ]
-- 20230526195910 不再错误地获取commit_text，而是直接获取get_selected_candidate().text
-- 20240128141207 重写：将读取设置移动到 init 方法中；简化中文取字方法；预先判断候选存在与否，无候选取 input
-- 20240508111725 当候选字数为 1 时，快捷键使该字上屏
-- 20250515093039 以词定字支持长句输入
-- 20250516231523 当候选字数为 1 且还有未处理的输入时，快捷键使该字上屏, 保留未处理部分
-- 20250524151149 当光标位置不在 input 末尾时,保留光标右侧部分
local select = {}

function select.init(env)
    select.configuration = require('configuration').setup(env)
    select.last_keys = select.configuration.select_character('last')
    select.first_keys = select.configuration.select_character('first')
end

function select.func(key, env)
    local engine = env.engine
    local context = env.engine.context

    if
        not key:release()
        and (context:is_composing() or context:has_menu())
        and (#select.first_keys > 0 or #select.last_keys > 0)
    then
        local input = context.input
        local selected_candidate = context:get_selected_candidate()
        selected_candidate = selected_candidate and selected_candidate.text or input

        local selected_char = ""

        -- 倒数 最后一个字需要特殊处理
        if #select.last_keys > 1 and key:repr() == select.last_keys[#select.last_keys] then
            -- 截取最后一个字
            selected_char = selected_candidate:sub(utf8.offset(selected_candidate, -1))
        end
        -- 倒数
        for index = #select.last_keys - 1, 1, -1 do
            if key:repr() == select.last_keys[index] then
                if utf8.len(selected_candidate) <= #select.last_keys - index then
                    -- 没有倒数第N个字, 截取第一个字
                    selected_char = selected_candidate:sub(1, utf8.offset(selected_candidate, 2) - 1)
                else
                    -- 有倒数第N个字, 截取倒数第N个字
                    selected_char = selected_candidate:sub(
                        utf8.offset(selected_candidate, index - #select.last_keys - 1),
                        utf8.offset(selected_candidate, index - #select.last_keys) - 1
                    )
                end
                break
            end
        end
        -- -- 正数
        for index = 1, #select.first_keys + 1, 1 do
            if key:repr() == select.first_keys[index] then
                if utf8.len(selected_candidate) < index then
                    -- 没有第N个字, 截取最后一个字
                    selected_char = selected_candidate:sub(utf8.offset(selected_candidate, -1))
                else
                    -- 有第N个字, 截取第N个字
                    selected_char = selected_candidate:sub(
                        utf8.offset(selected_candidate, index),
                        utf8.offset(selected_candidate, index + 1) - 1
                    )
                end
                break
            end
        end

        if selected_char == "" then
            return 2
        end
        local commit_text = context:get_commit_text()
        local _, end_pos = commit_text:find(selected_candidate)
        local caret_pos = context.caret_pos

        local part1 = commit_text:sub(1, end_pos):gsub(selected_candidate, selected_char)
        local part2 = commit_text:sub(end_pos + 1)

        engine:commit_text(part1)
        context:clear()
        if caret_pos ~= #input then
            part2 = part2 .. input:sub(caret_pos + 1)
        end
        if part2 ~= "" then
            context:push_input(part2)
        end
        return 1
    end
    return 2
end

return select
