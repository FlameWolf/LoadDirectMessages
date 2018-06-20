# LoadDirectMessages
Get an archive of all the messages from a Twitter DM conversation.
## How to use
1. Open Twitter in a browser tab.
2. Open the browser's developer console, copy-paste the contents of **LoadDirectMessages.js** into it, and press `Enter`.
3. Type the following command into the developer console: `loadDirectMessages("<<CONVERSATION-ID");` where `<<CONVERSATION-ID>>` is the ID of the conversation that you want to archive. (See [this guide by @Mincka](https://github.com/Mincka/DMArchiver#how-to-get-a-conversation_id) to find out how to get the conversation ID.)
4. Press `Enter` and the script will start archiving the messages in your DM conversation.

*(The script will stop executing when it gets to the very first message in the conversation. Each time the script reads a batch of messages, you will get an error message saying `SyntaxError: unexpected token: ':'` (or something else similar, depending on your browser) which can be ignored. It indicates that the script is working properly.)*

5. Once the task is complete, you will be prompted to save the output file to your desired location. Click **Save**.
6. You can use **Transform-DM-Conversation-XML.xsl** to transform the output XML file into HTML format for presentation. See **Sample-DM-Conversation-XML.xml** for an example.
## Known issues
If you have videos in your chat (not animated GIFs that Twitter converts to MP4 format, but any other kind of videos), the script will fail to load their URLs properly. This can be fixed in Chrome by following the below steps before running the script.
* Install the [Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) extension.
* Start the browser with the `--disable-web-security` and `--user-data-dir` command-line parameters.
* Click on the grey extension icon ![CSP Enabled](https://raw.githubusercontent.com/PhilGrayson/chrome-csp-disable/master/images/icon38-off.png) to turn off CSP headers. The extension will display a red icon ![CSP Disabled](https://raw.githubusercontent.com/PhilGrayson/chrome-csp-disable/master/images/icon38-on.png) when CSP headers are disabled.
