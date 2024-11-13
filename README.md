# termuxcord.nvim

That's a Neovim plugin designed primarily for Termux users. It sends rich presence information to Discord, showing details about what you are currently editing.

## Important Note
To use this plugin, you need to join the **[Discord server](https://discord.gg/8e4KDQmV8J)**. This is required for the plugin to function correctly.

## Features

- Displays the current file name in Discord
- Shows the file type and editing status
- Automatically updates as you switch files

## Installation

Use your favorite plugin manager to install:

### Using `vim-plug`

```vim
Plug 'lipeedev/termuxcord.nvim'
```

### Using `packer.nvim`

```lua
use 'lipeedev/termuxcord.nvim'
```

## Configuration
Here is an example of basic configuration:

```lua
require('termuxcord').setup({
    token = "your-token",
    title = "Termux",
    state = "Working on (%w)",
    details = "Editing %f",
    application_id = "your-application-id",
    repo_button_text = "Open Repository"
})
```

## Security Warning 

**Warning:** This plugin uses Discord WebSockets and requires the use of a user token, which violates Discord’s terms of service. Using this plugin may result in your Discord account being banned or other penalties. Use at your own risk.

## Contributions

Contributions are welcome! Feel free to open issues or submit pull requests.

## License
This project is licensed under the MIT License.

If you need any further adjustments or additional information, feel free to ask!


