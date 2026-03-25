local M = {}

function M.setup(env)
    if M.init then
        return M
    end
    M.init = true
    M.env = env
    M.release_code = (function()
        local code_name = rime_api:get_distribution_code_name()
        if code_name:lower():match('weasel') then
            -- Windows 小狼毫输入法
            return 'weasel'
        end
        if code_name:lower():match('hamster3') then
            -- iOS 元书输入法
            return 'hamster3'
        end
        return 'default'
    end)()
    return M
end

local function get_list(key)
    local release_key = string.gsub(key, '{}', M.release_code)
    local default_key = string.gsub(key, '{}', 'default')
    local list = M.env.engine.schema.config:get_list(release_key)
    if list == nil then
        list = M.env.engine.schema.config:get_list(default_key)
    end
    if list == nil then return nil end
    local lua_list = {}
    for index = 0, list.size - 1 do
        lua_list[index + 1] = list:get_value_at(index).value
    end
    return lua_list
end

function M.get_select_first_character()
    return get_list('key_binder/{}/select_character/first')
end

---@param type 'first'|'last'
function M.select_character(type)
    if not (type == 'first') or not (type == 'last') then
        log.error('configuration.select_character(type = ' .. tostring(type) .. ') ==> input error')
        return nil
    end
    return get_list('key_binder/{}/select_character/' .. type)
end

return M
