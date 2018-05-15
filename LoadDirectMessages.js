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
var hashtagLink = null;
var hashtagLinkText = EMPTY_STRING;
var timelineLink = null;
var timelineLinkUrl = EMPTY_STRING;
var mentionLink = null;
var mentionLinkText = EMPTY_STRING;
var cleanUpHtml = function(element) {
	currentElement = $(element);
	currentElement.find(".Emoji").each(function(index, value) {
		emojoPic = $(value);
		emojoPic.replaceWith(emojoPic.attr("alt"));
	});
	currentElement.find(".twitter-hashtag").each(function(index, value) {
		hashtagLink = $(value);
		hashtagLinkText = hashtagLink.text();
		hashtagLink.replaceWith(`<a class=\"hashtag\" href="https://twitter.com/hashtag/${hashtagLinkText.replace(/^#/, EMPTY_STRING)}" target="_blank">${hashtagLinkText}</a>`);
	});
	currentElement.find(".twitter-timeline-link[data-expanded-url]").each(function(index, value) {
		timelineLink = $(value);
		timelineLinkUrl = timelineLink.data("expanded-url");
		timelineLink.replaceWith(`<a class="hyperlink" href="${timelineLinkUrl}" target="_blank">${timelineLinkUrl}</a>`);
	});
	currentElement.find(".twitter-atreply").each(function(index, value) {
		mentionLink = $(value);
		mentionLinkText = mentionLink.text();
		mentionLink.replaceWith(`<a class="at-mention" href="https://twitter.com/${mentionLinkText.replace(/^@/, EMPTY_STRING)}" target="_blank" data-user-id="${mentionLink.data("mentioned-user-id")}">${mentionLinkText}</a>`);
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
						quotedTweetSenderName = escapeHtml(quotedTweetContainer.querySelector(".QuoteTweet-fullname").textContent);
						quotedTweetSenderHandle = quotedTweetContainer.querySelector(".username").textContent;
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
					return `<tweet id="${tweetContainer.getAttribute("data-message-id")}"><content>${tweetContainer.textContent.trim().replace(/\s\s+/g, " ")}</content></tweet>`;
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
			mentionLink = null;
			timelineLink = null;
			hashtagLink = null;
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
