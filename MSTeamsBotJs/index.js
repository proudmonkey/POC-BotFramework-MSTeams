// index.js is used to setup and configure your bot.

    // Import required packages
    const path = require('path');

    // Read botFilePath and botFileSecret from .env file.
    const ENV_FILE = path.join(__dirname, '.env');
    require('dotenv').config({ path: ENV_FILE });

    const express = require('express');
    const isInLambda = !!process.env.LAMBDA_TASK_ROOT;

    // Import required bot services.
    // See https://learn.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0 to learn more about the different parts of a bot.
    const {
        CloudAdapter,
        ConversationState,
        MemoryStorage,
        UserState,
        ConfigurationBotFrameworkAuthentication,
        TeamsSSOTokenExchangeMiddleware
    } = require('botbuilder');

    const { TeamsBot } = require('./bots/teams-bot');
    const { MainDialog } = require('./dialogs/main');
    const { env } = require('process');

    const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);

    var conname = env.ConnectionName;

    console.log(`\n${ conname } is the con name`);

    // Create adapter.
    // See https://learn.microsoft.com/javascript/api/botbuilder-core/botadapter?view=botbuilder-ts-latest to learn more about how bot adapter.
    const adapter = new CloudAdapter(botFrameworkAuthentication);
    const memoryStorage = new MemoryStorage();
    const tokenExchangeMiddleware = new TeamsSSOTokenExchangeMiddleware(memoryStorage, env.ConnectionName);

    adapter.use(tokenExchangeMiddleware);
    adapter.onTurnError = async (context, error) => {
        // This check writes out errors to console log .vs. app insights.
        // NOTE: In production environment, you must consider logging this to Azure
        //       application insights. See https://learn.microsoft.com/azure/bot-service/bot-builder-telemetry?view=azure-bot-service-4.0&tabs=csharp for telemetry
        //       configuration instructions.
        console.error(`\n [onTurnError] unhandled error: ${ error }`);

        // Send a trace activity, which is displayed in Bot Framework Emulator.
        await context.sendTraceActivity(
            'OnTurnError Trace',
            `${ error }`,
            'https://www.botframework.com/schemas/error',
            'TurnError'
        );

        // Send a message to the user.
        await context.sendActivity('The bot encountered an error or bug.');
        await context.sendActivity('To continue to run this bot, please fix the bot source code.');
        // Clear out state.
        await conversationState.delete(context);
    };

    // Define the state store for your bot.
    // See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
    // A bot requires a state storage system to persist the dialog and user state between messages.
    //const memoryStorage = new MemoryStorage();

    // Create conversation and user state with in-memory storage provider.
    const conversationState = new ConversationState(memoryStorage);
    const userState = new UserState(memoryStorage);

    // Create the main dialog.
    const dialog = new MainDialog();
    // Create the bot that will handle incoming messages.
    const bot = new TeamsBot(conversationState, userState, dialog);

    // Create HTTP server.
    const app = express();
    const port = process.env.port || process.env.PORT || 3978;

    if (isInLambda) {
        const serverlessExpress = require('aws-serverless-express');
        const server = serverlessExpress.createServer(app);
        exports.handler = (event, context) => serverlessExpress.proxy(server, event, context)
    } else {

        app.listen(port, () => {
            console.log("Running inside lambda? ",isInLambda);
            console.log(`\n${ app.name } listening to ${ port }`);
            console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
            console.log(`\nTo talk to your bot, open the emulator select "Open Bot"`);
        });
    }

    // Listen for incoming requests.
    app.post('/api/messages', async (req, res) => {
        console.log('Route received a request to adapter for processing.');
         // Route received a request to adapter for processing.
         await adapter.process(req, res, (context) => bot.run(context));
    });