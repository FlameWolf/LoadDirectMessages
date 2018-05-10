"use strict";
var EMPTY_STRING = "";
var result = EMPTY_STRING;
var max_entry_id = -1;
var ajaxResponse = null;
var conversation_id = "<<CONVERSATION-ID-GOES-HERE>>";
var baseUrl = `https://twitter.com/messages/with/conversation?id=${conversation_id}`;
var conversationUrl = baseUrl;
var itemsAsJSON = null;
var tweets = [];
var tweetContainer = null;
var tweetID = EMPTY_STRING;
var tweetDirection = EMPTY_STRING;
var tweetSenderID = EMPTY_STRING;
var tweetSenderHandle = EMPTY_STRING;
var tweetSenderName = EMPTY_STRING;
var tweetTimestamp = EMPTY_STRING;
var tweetContent = null;
var attachmentIFrameContainer = null;
var attachmentUrl = EMPTY_STRING;
var attachedImage = null;
var attachedImageUrl = EMPTY_STRING;
var playableMedia = null;
var tweetHtml = EMPTY_STRING;
var quotedTweetContainer = null;
var quotedTweetID = EMPTY_STRING;
var quotedTweetSenderID = EMPTY_STRING;
var quotedTweetSenderHandle = EMPTY_STRING;
var quotedTweetSenderName = EMPTY_STRING;
var quotedTweetContent = null;
var quotedTweet = EMPTY_STRING;
var terminator = "\n";
var escapeHtml = function(unsafe) {
	return unsafe.replace(/&/g, "&#x26;").replace(/</g, "&#x3C;").replace(/>/g, "&#x3E;").replace(/"/g, "&#x22;").replace(/'/g, "&#x27;");
};
var currentElement = null;
var emojoPic = null;
var hashTagLink = null;
var timeLineLink = null;
var cleanUpHtml = function(element) {
	currentElement = $(element);
	currentElement.find(".Emoji").each(function(index, value) {
		emojoPic = $(value);
		emojoPic.replaceWith(emojoPic.attr("alt"));
	});
	currentElement.find(".twitter-hashtag").each(function(index, value) {
		hashTagLink = $(value);
		hashTagLink.replaceWith(`<span class=\"hashtag\">${hashTagLink.text()}</span>`);
	});
	currentElement.find(".twitter-timeline-link").each(function(index, value) {
		timeLineLink = $(value);
		timeLineLink.html(timeLineLink.attr("data-expanded-url"));
	});
	return element.innerHTML.replace(/&amp;/g, "&#x26;").replace(/&lt;/g, "&#x3C;").replace(/&gt;/g, "&#x3E;").replace(/&nbsp;/g, "&#xA0;").replace(/\n/g, "&#x0A;");
};
var getVideoUrl = function(element) {
	return $(element).css("background-image").replace(/^url\(\"/, EMPTY_STRING).replace(/\"\)$/, EMPTY_STRING).replace("jpg", "mp4").replace("_preview", EMPTY_STRING).replace("pbs", "video");
}
var loadDirectMessages = function() {
	$.ajax(conversationUrl).done(function(response) {
		ajaxResponse = JSON.parse(response);
		if(ajaxResponse.min_entry_id != max_entry_id) {
			itemsAsJSON = ajaxResponse.items;
			tweets = Object.keys(itemsAsJSON).map(x => itemsAsJSON[x]).map(function(value, index, array) {
				tweetContainer = $.parseHTML(value)[0];
				if(tweetContainer.classList.contains("DirectMessage")) {
					tweetID = tweetContainer.getAttribute("data-item-id");
					tweetDirection = (tweetContainer.classList.contains("DirectMessage--sent") ? "sent" : "received");
					tweetSenderID = tweetContainer.getAttribute("data-sender-id");
					tweetSenderName = tweetContainer.querySelector(".DMAvatar-image").title;
					tweetSenderHandle = $(tweetContainer.querySelector(".js-user-profile-link")).attr("href").replace("/", "@");
					tweetTimestamp = tweetContainer.querySelector("._timestamp").getAttribute("data-time");
					tweetContent = tweetContainer.querySelector(".DirectMessage-text .tweet-text");
					attachmentIFrameContainer = tweetContainer.querySelector("[data-card-url]");
					attachedImage = tweetContainer.querySelector(".dm-attached-media");
					playableMedia = tweetContainer.querySelector(".PlayableMedia-player");
					quotedTweetContainer = tweetContainer.querySelector(".QuoteTweet");
					tweetHtml = (tweetContent == null ? EMPTY_STRING : cleanUpHtml(tweetContent));
					if(quotedTweetContainer != null) {
						quotedTweetID = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-item-id");
						quotedTweetSenderID = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-user-id");
						quotedTweetSenderName = escapeHtml(quotedTweetContainer.querySelector(".QuoteTweet-fullname").innerText);
						quotedTweetSenderHandle = quotedTweetContainer.querySelector(".username").innerText;
						quotedTweetContent = quotedTweetContainer.querySelector(".QuoteTweet-text");
						quotedTweet = (quotedTweetContent == null ? EMPTY_STRING : cleanUpHtml(quotedTweetContent));
						if(quotedTweet != EMPTY_STRING)
							quotedTweet = `<quote id="${quotedTweetID}"><sender id="${quotedTweetSenderID}" handle="${quotedTweetSenderHandle}" name="${quotedTweetSenderName}"/><content>${quotedTweet}</content></quote>`;
					}
					else
						quotedTweet = EMPTY_STRING;
					if(attachmentIFrameContainer != null) {
						attachmentUrl = attachmentIFrameContainer.getAttribute("data-card-url");
						tweetHtml = `<a href="${attachmentUrl}">${attachmentUrl}</a>${tweetHtml != EMPTY_STRING ? "<br/>" : EMPTY_STRING}${tweetHtml}`;
					}
					attachedImageUrl = (attachedImage != null ? attachedImage.querySelector("img").src.replace(":large", EMPTY_STRING) : EMPTY_STRING);
					if(attachedImageUrl != EMPTY_STRING)
						tweetHtml = `<img class="${attachedImageUrl.match(/^https:\/\/ton\.twimg\.com\/stickers\/stickers\//) ? "sticker" : "image"}" src="${attachedImageUrl}"/>${tweetHtml != EMPTY_STRING ? "<br/>" : EMPTY_STRING}${tweetHtml}`;
					if(playableMedia != null)
						tweetHtml = `<video class="video" controls="controls"><source src="${getVideoUrl(playableMedia)}" type="video/mp4"/></video>${tweetHtml != EMPTY_STRING ? "<br/>" : EMPTY_STRING}${tweetHtml}`;
					return (`<tweet id="${tweetID}" direction="${tweetDirection}" timestamp="${tweetTimestamp}"><sender id="${tweetSenderID}" handle="${tweetSenderHandle}" name="${tweetSenderName}"/>${quotedTweet}${tweetHtml != EMPTY_STRING ? "<content>" + tweetHtml + "</content>" : EMPTY_STRING}</tweet>`);
				}
				else
					return tweetContainer.outerHTML;
			});
			result = `${tweets.join(terminator)}${terminator}${result}`;
		}
		if(ajaxResponse.max_entry_id != ajaxResponse.min_entry_id) {
			max_entry_id = ajaxResponse.min_entry_id;
			conversationUrl = `${baseUrl}&max_entry_id=${max_entry_id}`;
			loadDirectMessages();
		}
		else {
			result = `<conversation id="${conversation_id}">${result}</conversation>`;
			copy(result);
			console.log("Done! XML data copied to clipboard.");
			timeLineLink = null;
			hashTagLink = null;
			emojoPic = null;
			currentElement = null;
			quotedTweetContent = null;
			quotedTweetContainer = null;
			tweetContainer = null;
			playableMedia = null;
			attachedImage = null;
			attachmentIFrameContainer = null;
			tweetContent = null;
			tweetContainer = null;
			tweets = null;
			itemsAsJSON = null;
			ajaxResponse = null;
		}
	});
};
loadDirectMessages();
