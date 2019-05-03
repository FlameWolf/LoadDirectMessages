# LoadDirectMessages
Get an archive of all the messages from a Twitter DM conversation.
## How to use
This script requires that CORS (Cross-Origin Resource Sharing) headers be disabled in your browser in order to fetch media files. Given below are the instructions on how to do it.
### Firefox:
- Install the [CORS Everywhere](https://addons.mozilla.org/firefox/addon/cors-everywhere) add-on.
- If the add-on icon on the toolbar is red, click on it. The icon colour will change to green, indicating that CSP headers are disabled.
### Chrome:
- Install the [Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) extension.
- Start the browser with the `--disable-web-security` and `--user-data-dir` command-line parameters.
- If the extension icon on the toolbar is grey, click on it. The icon colour will change to red, indicating that CSP headers are disabled.

Once you have disabled CORS headers, follow the below steps to execute the script.

1. Open Twitter in a browser tab.
2. Open the browser's developer console, copy-paste the contents of **LoadDirectMessages.js** into it, and press `Enter`.
3. Type the following command into the developer console: `loadDirectMessages("<<CONVERSATION-ID>>");` where `<<CONVERSATION-ID>>` is the ID of the conversation that you want to archive. (See [this guide by @Mincka](https://github.com/Mincka/DMArchiver#how-to-get-a-conversation_id) to find out how to get the conversation ID.)
4. Press `Enter` and the script will start archiving the messages in your DM conversation. A status bar above the console will display the date and time of the last message archived. Press **Pause** to pause the script. Press **Stop** to stop the script prematurely and save the partial output file.

   > Unless you press **Stop**, the script will continue executing until it reaches the very first message in the conversation. Do not switch to another tab or minimise the browser window while the script is running, as it may cause the browser to pause the script.
5. Once the task is complete, you will be prompted to save the output file to your desired location. Click **Save**.
6. You can use **Transform-DM-Conversation-XML.xsl** to transform the output XML file into HTML format for presentation. See **Sample-DM-Conversation-XML.xml** for an example.