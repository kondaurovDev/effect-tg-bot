# Effect TS Demonstration Bot

This project demonstrates the use of the Effect library by implementing a bot that retrieves messages using long polling. The bot is designed to be run locally.

## Configuration

Before running the bot, you need to set up your configuration file. Copy the `config.local.json` file to a file named `config.json` and adjust the settings according to your environment and needs.

```bash
cp config.local.json config.json
```

Edit the `config.json` file to match your specific configurations. This typically involves setting up your bot's API tokens, polling intervals, and other relevant settings.

## Installation

Make sure you have Node.js installed on your machine. Use `npm` to install the project dependencies.

```bash
npm install
```

## Running the Bot

Once you have configured your `config.json` and installed all dependencies, you can start the bot with:

```bash
npm start
```

This would boot up the bot, and it will begin listening for messages using long polling based on the configurations you have specified in `config.json`.

## Dependencies

This project is built using the Effect library for demonstrating functional effects in a Node.js application. Ensure you check out [Effect](https://github.com/Effect-TS/core) for more information on using Effect TS in your projects.

## Important Notes

- This bot is a demonstration of the Effect library's capabilities with long polling techniques. It is aimed at developers looking to understand how to leverage functional effects in their applications.
- Adjust the `config.json` carefully to match your use case. Misconfiguration might lead to undesirable behavior.
- Make sure your development environment is secure, especially when dealing with API tokens and other sensitive information.

Happy coding!
