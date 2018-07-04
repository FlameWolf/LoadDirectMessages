"use strict";
const loadDirectMessages = (function() {
	const emptyString = new String();
	let result = emptyString;
	let maxEntryId = emptyString;
	let ajaxResponse = null;
	let conversationId = emptyString;
	let baseURL = emptyString;
	let conversationURL = emptyString;
	let tweetContainer = null;
	let users = {};
	let tweetSenderId = emptyString;
	let tweetSenderHandle = emptyString;
	let tweetSenderAvatar = null;
	let tweetTimestamp = emptyString;
	let tweetContent = null;
	let attachmentType = emptyString;
	let attachmentURL = emptyString;
	let attachmentXML = emptyString;
	let hyperlinkContainer = null;
	let imageContainer = null;
	let videoContainer = null;
	let tweetHtml = emptyString;
	let quotedTweetContainer = null;
	let quotedTweetId = emptyString;
	let quotedTweetSenderId = emptyString;
	let quotedTweetSenderHandle = emptyString;
	let quotedTweetSenderNameContainer = null;
	let quotedTweetSenderName = emptyString;
	let quotedTweetContent = null;
	let quotedTweetHtml = emptyString;
	const terminator = "\n";
	let hashtagLinkText = emptyString;
	let timelineLinkURL = emptyString;
	let mentionLinkText = emptyString;
	let conversationEntryHtml = emptyString;
	let conversationJoinEntry = null;
	let userProfileLink = null;
	let userProfileImage = null;
	let videoTweetIds = new Array();
	(function() {
		Element.prototype.replaceWith = function(html) {
			this.insertAdjacentHTML("afterend", html);
			this.remove();
		};
		const open = XMLHttpRequest.prototype.open;
		XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
			this.requestURL = url;
			open.apply(this, arguments);
		};
	})();
	const escapeHtml = function(unsafe) {
		return unsafe.replace(/&/g, "&#x26;").replace(/</g, "&#x3C;").replace(/>/g, "&#x3E;").replace(/"/g, "&#x22;").replace(/'/g, "&#x27;");
	};
	const processHashtag = function(value) {
		hashtagLinkText = value.textContent;
		value.replaceWith(`<a class=\"hashtag\" href="https://twitter.com/hashtag/${hashtagLinkText.replace(/^#/, emptyString)}" target="_blank">${hashtagLinkText}</a>`);
	};
	const processHyperlink = function(value) {
		timelineLinkURL = (value.getAttribute("data-expanded-url") || `https://${value.textContent}`);
		value.replaceWith(`<a href="${timelineLinkURL}" target="_blank">${timelineLinkURL.replace(/^https?:\/\/(www\.)?/, emptyString)}</a>`);
	};
	const processMention = function(value) {
		mentionLinkText = value.textContent;
		value.replaceWith(`<a class="mention" href="https://twitter.com/${mentionLinkText.replace(/^@/, emptyString)}" target="_blank" data-user-id="${value.getAttribute("data-mentioned-user-id")}">${mentionLinkText}</a>`);
	};
	const processAvatar = function(value) {
		userProfileLink = value.querySelector("[class$=\"user-profile-link\"]");
		userProfileImage = value.querySelector(".DMAvatar-image");
		conversationEntryHtml += `<a class="avatar" href="${userProfileLink.href}" title="${userProfileImage.title}" target="_blank" data-user-id="${userProfileLink.getAttribute("data-user-id")}"><img src="${userProfileImage.src.replace(/_200x200\.jpg$/, "_400x400.jpg")}"/></a>`;
	};
	const cleanUpHtml = function(element) {
		[...element.querySelectorAll(".twitter-hashtag")].forEach(processHashtag);
		[...element.querySelectorAll(".twitter-timeline-link")].forEach(processHyperlink);
		[...element.querySelectorAll(".twitter-atreply")].forEach(processMention);
		if(element.classList.contains("DMConversationEntry")) {
			conversationEntryHtml = element.firstChild.textContent.trim();
			conversationJoinEntry = element.querySelector(".DMConversationJoinEntry");
			if(conversationJoinEntry != null) {
				conversationEntryHtml += `<br/>${conversationJoinEntry.querySelector(".DMConversationJoinEntry-message").textContent.trim()}<br/><span class="members">`;
				[...conversationJoinEntry.querySelectorAll(".DMConversationJoinEntry-avatar")].forEach(processAvatar);
				conversationEntryHtml = `${conversationEntryHtml}</span>`;
			}
			return conversationEntryHtml;
		}
		return element.innerHTML.trim().replace(/&amp;/g, "&#x26;").replace(/&lt;/g, "&#x3C;").replace(/&gt;/g, "&#x3E;").replace(/&nbsp;/g, "&#xA0;").replace(/\n/g, "&#x0A;");
	};
	const getVideoURL = function(element, tweetId) {
		if(element.classList.contains("PlayableMedia--gif"))
			return element.querySelector(".PlayableMedia-player").style["background-image"].match(/url\("(.*?)"\)/)[1].replace(".jpg", ".mp4").replace("/dm_gif_preview/", "/dm_gif/").replace("//pbs.", "//video.");
		else {
			videoTweetIds.push(tweetId);
			return `\${vid:${tweetId}}`;
		}
	};
	const saveXMLFile = function() {
		result = `<?xml version="1.0" encoding="UTF-8"?>\n${result}`;
		let xmlFile = new Blob([result], { type: "text/xml" });
		let anchorElement = document.createElement("a");
		let anchorElementStyle = anchorElement.style;
		anchorElement.href = URL.createObjectURL(xmlFile);
		anchorElement.download = `DM-Conversation-${conversationId}.xml`;
		anchorElementStyle.display = "none";
		anchorElementStyle.visibility = "hidden";
		anchorElementStyle.opacity = 0;
		document.body.appendChild(anchorElement);
		anchorElement.click();
		setTimeout(function() {
			URL.revokeObjectURL(anchorElement.href);
			document.body.removeChild(anchorElement);
			anchorElementStyle = null;
			anchorElement = null;
			xmlFile = null;
			result = emptyString;
		}, 0);
	};
	const transformJsonEntry = function([key, value]) {
		return `${key}="${value}"`;
	};
	const generateUserXML = function([key, value]) {
		return `<user id="${key}" ${Object.entries(value).map(transformJsonEntry).join(" ")}/>`;
	};
	const finish = function() {
		const participantsXML = Object.entries(users).map(generateUserXML).join(terminator);
		result = `<conversation id="${conversationId}">\n<participants>\n${participantsXML}\n</participants>\n<tweets>${result}</tweets>\n</conversation>`;
		saveXMLFile();
		videoTweetIds = new	Array();
		userProfileImage = null;
		userProfileLink = null;
		conversationJoinEntry = null;
		conversationEntryHtml = emptyString;
		mentionLinkText = emptyString;
		timelineLinkURL = emptyString;
		hashtagLinkText = emptyString;
		quotedTweetHtml = emptyString;
		quotedTweetContent = null;
		quotedTweetSenderName = emptyString;
		quotedTweetSenderNameContainer = null;
		quotedTweetSenderHandle = emptyString;
		quotedTweetSenderId = emptyString;
		quotedTweetId = emptyString;
		quotedTweetContainer = null;
		tweetHtml = emptyString;
		videoContainer = null;
		imageContainer = null;
		hyperlinkContainer = null;
		attachmentXML = emptyString;
		attachmentURL = emptyString;
		attachmentType = emptyString;
		tweetContent = null;
		tweetTimestamp = emptyString;
		tweetSenderAvatar = null;
		tweetSenderHandle = emptyString;
		tweetSenderId = emptyString;
		users = {};
		tweetContainer = null;
		conversationURL = emptyString;
		baseURL = emptyString;
		conversationId = emptyString;
		ajaxResponse = null;
		maxEntryId = emptyString;
	};
	const updateVideoURL = function(value, index, source) {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", `https://mobile.twitter.com/messages/media/${value}`);
		xhr.setRequestHeader("Accept", "text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8");
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() {
			if(xhr.readyState == XMLHttpRequest.DONE) {
				result = result.replace(new RegExp(`(<attachment type="video" url=")(\\\${vid:${value}})("/>)`), `$1${(xhr.status == 200 ? xhr.responseURL : xhr.requestURL)}$3`);
				source.splice(source.indexOf(value), 1);
				if(source.length == 0)
					finish();
				xhr = null;
			}
		};
		xhr.send();
	};
	const fixVideoURLs = function(items) {
		if(items.length == 0)
			finish();
		else
			items.forEach(updateVideoURL);
	};
	const removeElement = function(value) {
		value.remove();
	};
	const processTweet = function([key, value]) {
		value = value.replace(/<img\s+.*?class="\s*Emoji\s*.*?".*?alt="(.*?)".*?>/g, "$1");
		tweetContainer = $.parseHTML(value)[0];
		if(tweetContainer.classList.contains("DirectMessage")) {
			tweetSenderId = tweetContainer.getAttribute("data-sender-id");
			tweetSenderHandle = tweetContainer.querySelector(".js-user-profile-link").getAttribute("href").replace(/^\//, emptyString);
			tweetSenderAvatar = tweetContainer.querySelector(".DMAvatar-image");
			tweetTimestamp = tweetContainer.querySelector("._timestamp").getAttribute("data-time");
			tweetContent = tweetContainer.querySelector(".DirectMessage-text .tweet-text");
			hyperlinkContainer = tweetContainer.querySelector("[data-card-url]");
			imageContainer = tweetContainer.querySelector(".dm-attached-media");
			videoContainer = tweetContainer.querySelector(".PlayableMedia");
			quotedTweetContainer = tweetContainer.querySelector(".QuoteTweet");
			tweetHtml = (tweetContent == null ? emptyString : cleanUpHtml(tweetContent));
			if(quotedTweetContainer != null) {
				attachmentType = "tweet";
				quotedTweetId = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-item-id");
				quotedTweetSenderId = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-user-id");
				quotedTweetSenderHandle = quotedTweetContainer.querySelector(".username > b").textContent;
				quotedTweetSenderNameContainer = quotedTweetContainer.querySelector(".QuoteTweet-fullname");
				[...quotedTweetSenderNameContainer.querySelectorAll(".Emoji")].forEach(removeElement);
				quotedTweetSenderName = escapeHtml(quotedTweetSenderNameContainer.textContent);
				quotedTweetContent = quotedTweetContainer.querySelector(".QuoteTweet-text");
				quotedTweetHtml = (quotedTweetContent == null ? emptyString : cleanUpHtml(quotedTweetContent));
			}
			else if(hyperlinkContainer != null) {
				attachmentType = "hyperlink";
				attachmentURL = hyperlinkContainer.getAttribute("data-card-url");
			}
			else if(imageContainer != null) {
				attachmentURL = imageContainer.querySelector("img").src.replace(":large", emptyString);
				attachmentType = (attachmentURL.match(/^https:\/\/ton\.twimg\.com\/stickers\/stickers\//) ? "sticker" : "image");
			}
			else if(videoContainer != null) {
				attachmentType = "video";
				attachmentURL = getVideoURL(videoContainer, key);
			}
			else
				attachmentType = emptyString;
			switch(attachmentType)
			{
				case "tweet":
					attachmentXML = `<attachment type="${attachmentType}" id="${quotedTweetId}"><sender id="${quotedTweetSenderId}" handle="${quotedTweetSenderHandle}" name="${quotedTweetSenderName}"/><content>${quotedTweetHtml}</content></attachment>`;
					break;
				case "hyperlink":
				case "sticker":
				case "image":
				case "video":
					attachmentXML = `<attachment type="${attachmentType}" url="${attachmentURL}"/>`;
					break;
				default:
					attachmentXML = emptyString;
					break;
			}
			if(users[tweetSenderId] == null)
				users[tweetSenderId] = { "handle": tweetSenderHandle, "name": tweetSenderAvatar.title, "avatar": tweetSenderAvatar.src.replace(/_200x200.jpg$/, "_400x400.jpg"), ...(tweetContainer.classList.contains("DirectMessage--sent") ? { "self": true } : null) };
			return `<tweet id="${key}" timestamp="${tweetTimestamp}" sender="${tweetSenderId}">${attachmentXML}${tweetHtml != emptyString ? `<content>${tweetHtml}</content>` : emptyString}</tweet>`;
		}
		else
			return `<tweet id="${key}"><content>${cleanUpHtml(tweetContainer)}</content></tweet>`;
	};
	const transformDMConversationHTML = function() {
		$.ajax(conversationURL).done(function(response) {
			ajaxResponse = JSON.parse(response);
			if(ajaxResponse.min_entry_id != maxEntryId)
				result = `${Object.entries(ajaxResponse.items).map(processTweet).join(terminator)}${terminator}${result}`;
			if(ajaxResponse.max_entry_id != ajaxResponse.min_entry_id) {
				maxEntryId = ajaxResponse.min_entry_id;
				conversationURL = `${baseURL}&max_entry_id=${maxEntryId}`;
				transformDMConversationHTML();
			}
			else
				fixVideoURLs(videoTweetIds);
		});
	};
	return function(value) {
		conversationId = value;
		baseURL = `https://twitter.com/messages/with/conversation?id=${conversationId}`;
		conversationURL = baseURL;
		transformDMConversationHTML();
		const timer = setInterval(function() {
			if(ajaxResponse != null)
				console.clear();
			else
				clearInterval(timer);
		}, 15000);
	};
})();
