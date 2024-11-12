_G.node_process_id = nil
_G.start_timestamp = math.floor(require('socket').gettime() * 1000)

local M = {}
local config = {}


function M.setup(_config)
  config.token = _config.token or nil
  config.title = _config.title or "Termux"
  config.state = _config.state or "Working on (%w)"
  config.details = _config.details or "Editing %f"
  config.start_timestamp = _G.start_timestamp
  config.application_id = _config.application_id or '959986722807111691'
  config.repo_button_text = _config.repo_button_text or "Open Repository"

  local cwd = vim.fn.getcwd()
  config.cwd = cwd
  config.workspace = vim.fn.fnamemodify(cwd, ':t') or "No workspace"
end

local function get_js_path()
  local init_path = vim.api.nvim_get_runtime_file("lua/termuxcord/init.lua", false)[1]
  local dir_path = init_path:match("(.*/)")
  return dir_path .. "rpc.js"
end

local function update_discord_presence()
  if not config.token or config.token == "" then
    print("[termux-rpc] No token provided. Please set it up in your config.")
    return
  end

  config.filename = vim.fn.expand('%:t') or "None"

  if _G.node_process_id then
    vim.fn.jobstop(_G.node_process_id)
  end

  local js_file_dir = get_js_path()
  local command = "node " .. js_file_dir .. " '" .. vim.fn.json_encode(config) .. "'"

  _G.node_process_id = vim.fn.jobstart(command, {
    on_exit = function()
    end
  })
end

vim.api.nvim_create_autocmd({ "BufEnter", "BufWinEnter" }, {
  pattern = "*",
  callback = update_discord_presence
})

vim.api.nvim_create_autocmd({ "VimLeavePre" }, {
  callback = function()
    if _G.node_process_id then
      vim.fn.jobstop(_G.node_process_id)
      _G.node_process_id = nil
    end

    _G.start_timestamp = nil
  end
})

return M
