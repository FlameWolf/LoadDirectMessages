"use strict";
var EMPTY_STRING = "";
var result = EMPTY_STRING;
var max_entry_id = -1;
var ajaxResponse = null;
var conversationID = "<<CONVERSATION-ID-GOES-HERE>>";
var baseURL = `https://twitter.com/messages/with/conversation?id=${conversationID}`;
var conversationURL = baseURL;
var itemsAsJson = null;
var tweets = [];
var tweetContainer = null;
var tweetID = EMPTY_STRING;
var tweetDirection = EMPTY_STRING;
var tweetSenderID = EMPTY_STRING;
var tweetSenderHandle = EMPTY_STRING;
var tweetSenderName = EMPTY_STRING;
var tweetTimestamp = EMPTY_STRING;
var tweetContent = null;
var attachmentType = EMPTY_STRING;
var attachmentURL = EMPTY_STRING;
var attachmentXML = EMPTY_STRING;
var hyperlinkContainer = null;
var imageContainer = null;
var videoContainer = null;
var tweetHtml = EMPTY_STRING;
var quotedTweetContainer = null;
var quotedTweetID = EMPTY_STRING;
var quotedTweetSenderID = EMPTY_STRING;
var quotedTweetSenderHandle = EMPTY_STRING;
var quotedTweetSenderName = EMPTY_STRING;
var quotedTweetContent = null;
var quotedTweetHtml = EMPTY_STRING;
var terminator = "\n";
var currentElement = null;
var hashtagLink = null;
var hashtagLinkText = EMPTY_STRING;
var timelineLink = null;
var timelineLinkURL = EMPTY_STRING;
var mentionLink = null;
var mentionLinkText = EMPTY_STRING;
var conversationEntryHtml = EMPTY_STRING;
var conversationJoinEntry = null;
var userProfileLink = null;
var userProfileImage = null;
var videoTweetIDs = [];
var escapeHtml = function(unsafe) {
	return unsafe.replace(/&/g, "&#x26;").replace(/</g, "&#x3C;").replace(/>/g, "&#x3E;").replace(/"/g, "&#x22;").replace(/'/g, "&#x27;");
};
var cleanUpHtml = function(element) {
	currentElement = $(element);
	currentElement.find(".twitter-hashtag").each(function(index, value) {
		hashtagLink = $(value);
		hashtagLinkText = hashtagLink.text();
		hashtagLink.replaceWith(`<a class=\"hashtag\" href="https://twitter.com/hashtag/${hashtagLinkText.replace(/^#/, EMPTY_STRING)}" target="_blank">${hashtagLinkText}</a>`);
	});
	currentElement.find(".twitter-timeline-link[data-expanded-url]").each(function(index, value) {
		timelineLink = $(value);
		timelineLinkURL = timelineLink.data("expanded-url");
		timelineLink.replaceWith(`<a href="${timelineLinkURL}" target="_blank">${timelineLinkURL}</a>`);
	});
	currentElement.find(".twitter-atreply").each(function(index, value) {
		mentionLink = $(value);
		mentionLinkText = mentionLink.text();
		mentionLink.replaceWith(`<a class="mention" href="https://twitter.com/${mentionLinkText.replace(/^@/, EMPTY_STRING)}" target="_blank" data-user-id="${mentionLink.data("mentioned-user-id")}">${mentionLinkText}</a>`);
	});
	if(element.classList.contains("DMConversationEntry")) {
		conversationEntryHtml = element.firstChild.textContent.trim();
		conversationJoinEntry = element.querySelector(".DMConversationJoinEntry");
		if(conversationJoinEntry != null) {
			conversationEntryHtml += `<br/>${conversationJoinEntry.querySelector(".DMConversationJoinEntry-message").textContent.trim()}<br/><span class="members">`;
			[...conversationJoinEntry.querySelectorAll(".DMConversationJoinEntry-avatar")].map(function(value, index, source) {
				userProfileLink = value.querySelector("[class$=\"user-profile-link\"]");
				userProfileImage = value.querySelector(".DMAvatar-image");
				conversationEntryHtml += `<a class="avatar" href="${userProfileLink.href}" title="${userProfileImage.title}" target="_blank" data-user-id="${userProfileLink.getAttribute("data-user-id")}"><img src="${userProfileImage.src}"/></a>`;
			});
			conversationEntryHtml = `${conversationEntryHtml}</span>`;
		}
		return conversationEntryHtml;
	}
	return element.innerHTML.replace(/&amp;/g, "&#x26;").replace(/&lt;/g, "&#x3C;").replace(/&gt;/g, "&#x3E;").replace(/&nbsp;/g, "&#xA0;").replace(/\n/g, "&#x0A;");
};
var getVideoURL = function(element) {
	if(element.classList.contains("PlayableMedia--gif"))
		return element.querySelector(".PlayableMedia-player").style["background-image"].match(/url\("(.*?)"\)/)[1].replace(".jpg", ".mp4").replace("/dm_gif_preview/", "/dm_gif/").replace("//pbs.", "//video.");
	else {
		videoTweetIDs.push(tweetID);
		return `\${vid:${tweetID}}`;
	}
};
var fixVideoURLs = function(items) {
	if(items.length == 0)
		finish();
	else {
		items.map(function(value) {
			var xmlHttpReq = new XMLHttpRequest();
			xmlHttpReq.open("GET", `https://mobile.twitter.com/messages/media/${value}`);
			xmlHttpReq.setRequestHeader("Accept", "text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8");
			xmlHttpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xmlHttpReq.onreadystatechange = function() {
				if(xmlHttpReq.readyState == XMLHttpRequest.DONE) {
					result = result.replace(new RegExp(`(<attachment type="video" url=")(\\\${vid:${value}})("/>)`), `$1${xmlHttpReq.responseURL}$3`);
					items.splice(items.indexOf(value), 1);
					if(items.length == 0)
						finish();
				}
			};
			xmlHttpReq.send();
		});
	}
};
var copyResultToClipboard = function() {
	var textArea = document.createElement("textArea");
	textArea.setAttribute("readonly", true);
	textArea.value = result;
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand("copy");
	console.log("Done! XML data copied to clipboard.");
	document.body.removeChild(textArea);
	textArea = null;
};
var finish = function() {
	result = `<conversation id="${conversationID}">${result}</conversation>`;
	copyResultToClipboard();
	videoTweetIDs = null;
	userProfileImage = null;
	userProfileLink = null;
	conversationJoinEntry = null;
	mentionLink = null;
	timelineLink = null;
	hashtagLink = null;
	currentElement = null;
	quotedTweetContent = null;
	quotedTweetContainer = null;
	tweetContainer = null;
	videoContainer = null;
	imageContainer = null;
	hyperlinkContainer = null;
	tweetContent = null;
	tweetContainer = null;
	tweets = null;
	itemsAsJson = null;
	ajaxResponse = null;
};
var loadDirectMessages = function() {
	$.ajax(conversationURL).done(function(response) {
		ajaxResponse = JSON.parse(response);
		if(ajaxResponse.min_entry_id != max_entry_id) {
			itemsAsJson = ajaxResponse.items;
			tweets = Object.keys(itemsAsJson).map(x => itemsAsJson[x]).map(function(value, index, source) {
				value = value.replace(/<img\s+.*?class="\s*Emoji\s*.*?".*?alt="(.*?)".*?>/g, "$1");
				tweetContainer = $.parseHTML(value)[0];
				if(tweetContainer.classList.contains("DirectMessage")) {
					tweetID = tweetContainer.getAttribute("data-item-id");
					tweetDirection = (tweetContainer.classList.contains("DirectMessage--sent") ? "sent" : "received");
					tweetSenderID = tweetContainer.getAttribute("data-sender-id");
					tweetSenderName = tweetContainer.querySelector(".DMAvatar-image").title;
					tweetSenderHandle = $(tweetContainer.querySelector(".js-user-profile-link")).attr("href").replace("/", "@");
					tweetTimestamp = tweetContainer.querySelector("._timestamp").getAttribute("data-time");
					tweetContent = tweetContainer.querySelector(".DirectMessage-text .tweet-text");
					hyperlinkContainer = tweetContainer.querySelector("[data-card-url]");
					imageContainer = tweetContainer.querySelector(".dm-attached-media");
					videoContainer = tweetContainer.querySelector(".PlayableMedia");
					quotedTweetContainer = tweetContainer.querySelector(".QuoteTweet");
					tweetHtml = (tweetContent == null ? EMPTY_STRING : cleanUpHtml(tweetContent));
					if(quotedTweetContainer != null) {
						attachmentType = "tweet";
						quotedTweetID = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-item-id");
						quotedTweetSenderID = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-user-id");
						quotedTweetSenderName = escapeHtml(quotedTweetContainer.querySelector(".QuoteTweet-fullname").textContent);
						quotedTweetSenderHandle = quotedTweetContainer.querySelector(".username").textContent;
						quotedTweetContent = quotedTweetContainer.querySelector(".QuoteTweet-text");
						quotedTweetHtml = (quotedTweetContent == null ? EMPTY_STRING : cleanUpHtml(quotedTweetContent));
					}
					else if(hyperlinkContainer != null) {
						attachmentType = "hyperlink";
						attachmentURL = hyperlinkContainer.getAttribute("data-card-url");
					}
					else if(imageContainer != null) {
						attachmentURL = imageContainer.querySelector("img").src.replace(":large", EMPTY_STRING);
						attachmentType = (attachmentURL.match(/^https:\/\/ton\.twimg\.com\/stickers\/stickers\//) ? "sticker" : "image");
					}
					else if(videoContainer != null) {
						attachmentType = "video";
						attachmentURL = getVideoURL(videoContainer);
					}
					else
						attachmentType = EMPTY_STRING;
					switch(attachmentType)
					{
						case "tweet":
							attachmentXML = `<attachment type="${attachmentType}" tweet-id="${quotedTweetID}"><sender id="${quotedTweetSenderID}" handle="${quotedTweetSenderHandle}" name="${quotedTweetSenderName}"/><content>${quotedTweetHtml}</content></attachment>`;
							break;
						case "hyperlink":
						case "sticker":
						case "image":
						case "video":
							attachmentXML = `<attachment type="${attachmentType}" url="${attachmentURL}"/>`;
							break;
						default:
							attachmentXML = EMPTY_STRING;
							break;
					}
					return `<tweet id="${tweetID}" direction="${tweetDirection}" timestamp="${tweetTimestamp}"><sender id="${tweetSenderID}" handle="${tweetSenderHandle}" name="${tweetSenderName}"/>${attachmentXML}${tweetHtml != EMPTY_STRING ? "<content>" + tweetHtml + "</content>" : EMPTY_STRING}</tweet>`;
				}
				else
					return `<tweet id="${tweetContainer.getAttribute("data-message-id")}"><content>${cleanUpHtml(tweetContainer)}</content></tweet>`;
			});
			result = `${tweets.join(terminator)}${terminator}${result}`;
		}
		if(ajaxResponse.max_entry_id != ajaxResponse.min_entry_id) {
			max_entry_id = ajaxResponse.min_entry_id;
			conversationURL = `${baseURL}&max_entry_id=${max_entry_id}`;
			loadDirectMessages();
		}
		else
			fixVideoURLs(videoTweetIDs);
	});
};
loadDirectMessages();
