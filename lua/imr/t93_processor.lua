local Processor = {
    init = function(env) end,
    func = function(key, env)
        local engine = env.engine
        local context = engine.context
        if
            not key:release()
            and (context:is_composing() or context:has_menu())
        then
            local key_repr = key:repr()
            if key_repr == '0' then
                if
                    -- 完整拼音+'0' 触发笔画反查 '`'
                    #context.input > 0 and #context.input % 3 == 0
                    and context.input:match('^[0-9]+$')
                then
                    context:push_input('`')
                    return 1
                end
                if #context.input >= 4
                    and context.input:match('^[0-9]+`.*$')
                then
                    context:push_input('`')
                    return 1
                end
            end
        end
        return 2
    end
}

return Processor
