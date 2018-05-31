# LoadDirectMessages
Get an archive of all the messages from a Twitter DM conversation.
## How to use
1. Open Twitter in a browser tab.
2. Open the browser's developer console and copy-paste the contents of **LoadDirectMessages.js** into it.
3. Replace the string `<<CONVERSATION-ID-GOES-HERE>>` with the ID of the conversation that you want to archive. (Visit [this guide by @Mincka](https://github.com/Mincka/DMArchiver#how-to-get-a-conversation_id) to find out how to get the conversation ID.)
4. Press `Enter` and the function will start reading your DMs and storing them into a variable called `result`.

*(The function will stop executing when it gets to the very first message in the conversation. Each time the function reads a batch of messages, you will get an error message saying `SyntaxError: unexpected token: ':'` (or something else similar, depending on your browser), which can be ignored. It indicates that the function is working properly. You'll know that the job is complete when the error messages stop appearing. You can run the command ``​`size: ${result.length/1000000} MB; time: ${new Date(parseInt(tweetTimestamp)*1000)}`;​`` during execution to see the size of the archive in MB as well as the send/recieved time of the oldest message archived. If you run this command twice and the result is the same, the function has stopped executing.)*

5. Run the following command to copy the archive into clipboard: `copy(result);`.
6. You can save the XML file and use **Transform-DM-Conversation-XML.xsl** to transform it into HTML format for presentation. See **Sample-DM-Conversation-XML.xml** for an example.
## Known issues
If you have videos in your chat (not animated GIFs that Twitter converts to MP4 format, but any other kind of videos), then this script will fail to load their URLs properly. This can be fixed in Chrome by following the below steps.
* Install the [Disable Content-Security-Policy](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden) extension.
* Start the browser with the `--disable-web-security` and `--user-data-dir` command-line parameters.
* Click on the grey extension icon ![CSP Enabled](https://raw.githubusercontent.com/PhilGrayson/chrome-csp-disable/master/images/icon38-off.png) to turn off CSP headers. The extension will display a red icon ![CSP Disabled](https://raw.githubusercontent.com/PhilGrayson/chrome-csp-disable/master/images/icon38-on.png) when CSP headers are disabled.
