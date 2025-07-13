_G.node_process_id = nil
local dateTable = os.date("!*t")
_G.start_timestamp = (os.time(dateTable) * 1000)
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
  local script_path = debug.getinfo(1, "S").source:sub(2):match("(.*/)")
  local rpc_path = script_path .. "rpc.js"
  return rpc_path
end

local function update_discord_presence()
  if not config.token or config.token == "" then
    print("[termuxcord] No token provided. Please set it up in your config.")
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

local function install_node_dependencies()
  local script_path = debug.getinfo(1, "S").source:sub(2):match("(.*/)")
  local node_modules_path = script_path .. "node_modules"

  if vim.fn.empty(vim.fn.glob(node_modules_path)) == 1 then
    print('[termuxcord] Installing Node.js dependencies...')

    vim.fn.jobstart('npm install', {
      cwd = script_path,
      on_exit = function(_, code)
        if code == 0 then
          print("[termuxcord] Node.js dependencies installed successfully.")
          update_discord_presence()
        else
          print("[termuxcord] Failed to install Node.js dependencies.")
        end
      end
    })
  end
end

vim.api.nvim_create_autocmd({ "BufEnter", "BufWinEnter" }, {
  pattern = "*",
  callback = function()
    install_node_dependencies()
    update_discord_presence()
  end
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
