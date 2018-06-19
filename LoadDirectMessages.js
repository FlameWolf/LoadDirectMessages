(function() {
	"use strict";
	const EMPTY_STRING = "";
	let result = EMPTY_STRING;
	let max_entry_id = -1;
	let ajaxResponse = null;
	const conversationID = "<<CONVERSATION-ID-GOES-HERE>>";
	const baseURL = `https://twitter.com/messages/with/conversation?id=${conversationID}`;
	let conversationURL = baseURL;
	let itemsAsJson = null;
	let tweets = [];
	let tweetContainer = null;
	let tweetID = EMPTY_STRING;
	let tweetDirection = EMPTY_STRING;
	let tweetSenderID = EMPTY_STRING;
	let tweetSenderHandle = EMPTY_STRING;
	let tweetSenderName = EMPTY_STRING;
	let tweetTimestamp = EMPTY_STRING;
	let tweetContent = null;
	let attachmentType = EMPTY_STRING;
	let attachmentURL = EMPTY_STRING;
	let attachmentXML = EMPTY_STRING;
	let hyperlinkContainer = null;
	let imageContainer = null;
	let videoContainer = null;
	let tweetHtml = EMPTY_STRING;
	let quotedTweetContainer = null;
	let quotedTweetID = EMPTY_STRING;
	let quotedTweetSenderID = EMPTY_STRING;
	let quotedTweetSenderHandle = EMPTY_STRING;
	let quotedTweetSenderNameContainer = null;
	let quotedTweetSenderName = EMPTY_STRING;
	let quotedTweetContent = null;
	let quotedTweetHtml = EMPTY_STRING;
	const terminator = "\n";
	let hashtagLinkText = EMPTY_STRING;
	let timelineLinkURL = EMPTY_STRING;
	let mentionLinkText = EMPTY_STRING;
	let conversationEntryHtml = EMPTY_STRING;
	let conversationJoinEntry = null;
	let userProfileLink = null;
	let userProfileImage = null;
	let videoTweetIDs = [];
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
	const cleanUpHtml = function(element) {
		[...element.querySelectorAll(".twitter-hashtag")].map(function(value) {
			hashtagLinkText = value.textContent;
			value.replaceWith(`<a class=\"hashtag\" href="https://twitter.com/hashtag/${hashtagLinkText.replace(/^#/, EMPTY_STRING)}" target="_blank">${hashtagLinkText}</a>`);
		});
		[...element.querySelectorAll(".twitter-timeline-link")].map(function(value) {
			timelineLinkURL = (value.getAttribute("data-expanded-url") || `https://${value.textContent}`);
			value.replaceWith(`<a href="${timelineLinkURL}" target="_blank">${timelineLinkURL}</a>`);
		});
		[...element.querySelectorAll(".twitter-atreply")].map(function(value) {
			mentionLinkText = value.textContent;
			value.replaceWith(`<a class="mention" href="https://twitter.com/${mentionLinkText.replace(/^@/, EMPTY_STRING)}" target="_blank" data-user-id="${value.getAttribute("data-mentioned-user-id")}">${mentionLinkText}</a>`);
		});
		if(element.classList.contains("DMConversationEntry")) {
			conversationEntryHtml = element.firstChild.textContent.trim();
			conversationJoinEntry = element.querySelector(".DMConversationJoinEntry");
			if(conversationJoinEntry != null) {
				conversationEntryHtml += `<br/>${conversationJoinEntry.querySelector(".DMConversationJoinEntry-message").textContent.trim()}<br/><span class="members">`;
				[...conversationJoinEntry.querySelectorAll(".DMConversationJoinEntry-avatar")].map(function(value) {
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
	const getVideoURL = function(element) {
		if(element.classList.contains("PlayableMedia--gif"))
			return element.querySelector(".PlayableMedia-player").style["background-image"].match(/url\("(.*?)"\)/)[1].replace(".jpg", ".mp4").replace("/dm_gif_preview/", "/dm_gif/").replace("//pbs.", "//video.");
		else {
			videoTweetIDs.push(tweetID);
			return `\${vid:${tweetID}}`;
		}
	};
	const saveXMLFile = function() {
		result = `<?xml version="1.0" encoding="UTF-8"?>\n${result}`;
		let xmlFile = new Blob([result], { type: "text/xml" });
		let anchorElement = document.createElement("a");
		let anchorElementStyle = anchorElement.style;
		anchorElement.href = URL.createObjectURL(xmlFile);
		anchorElement.download = `DM-Conversation-${conversationID}.xml`;
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
			result = EMPTY_STRING;
		}, 0);
	};
	const finish = function() {
		result = `<conversation id="${conversationID}">${result}</conversation>`;
		saveXMLFile();
		videoTweetIDs = null;
		userProfileImage = null;
		userProfileLink = null;
		conversationJoinEntry = null;
		quotedTweetContent = null;
		quotedTweetSenderNameContainer = null;
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
	const fixVideoURLs = function(items) {
		if(items.length == 0)
			finish();
		else {
			items.map(function(value) {
				let xhr = new XMLHttpRequest();
				xhr.open("GET", `https://mobile.twitter.com/messages/media/${value}`);
				xhr.setRequestHeader("Accept", "text/html, application/xhtml+xml, application/xml; q=0.9, */*; q=0.8");
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.onreadystatechange = function() {
					if(xhr.readyState == XMLHttpRequest.DONE) {
						result = result.replace(new RegExp(`(<attachment type="video" url=")(\\\${vid:${value}})("/>)`), `$1${(xhr.status == 200 ? xhr.responseURL : xhr.requestURL)}$3`);
						items.splice(items.indexOf(value), 1);
						if(items.length == 0)
							finish();
						xhr = null;
					}
				};
				xhr.send();
			});
		}
	};
	const loadDirectMessages = function() {
		$.ajax(conversationURL).done(function(response) {
			ajaxResponse = JSON.parse(response);
			if(ajaxResponse.min_entry_id != max_entry_id) {
				itemsAsJson = ajaxResponse.items;
				tweets = Object.keys(itemsAsJson).map(x => itemsAsJson[x]).map(function(value) {
					value = value.replace(/<img\s+.*?class="\s*Emoji\s*.*?".*?alt="(.*?)".*?>/g, "$1");
					tweetContainer = $.parseHTML(value)[0];
					if(tweetContainer.classList.contains("DirectMessage")) {
						tweetID = tweetContainer.getAttribute("data-item-id");
						tweetDirection = (tweetContainer.classList.contains("DirectMessage--sent") ? "0" : "1");
						tweetSenderID = tweetContainer.getAttribute("data-sender-id");
						tweetSenderName = tweetContainer.querySelector(".DMAvatar-image").title;
						tweetSenderHandle = tweetContainer.querySelector(".js-user-profile-link").getAttribute("href").replace(/^\//, EMPTY_STRING);
						tweetTimestamp = tweetContainer.querySelector("._timestamp").getAttribute("data-time");
						tweetContent = tweetContainer.querySelector(".DirectMessage-text .tweet-text");
						hyperlinkContainer = tweetContainer.querySelector("[data-card-url]");
						imageContainer = tweetContainer.querySelector(".dm-attached-media");
						videoContainer = tweetContainer.querySelector(".PlayableMedia");
						quotedTweetContainer = tweetContainer.querySelector(".QuoteTweet");
						tweetHtml = (tweetContent == null ? EMPTY_STRING : cleanUpHtml(tweetContent).trim());
						if(quotedTweetContainer != null) {
							attachmentType = "tweet";
							quotedTweetID = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-item-id");
							quotedTweetSenderID = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-user-id");
							quotedTweetSenderNameContainer = quotedTweetContainer.querySelector(".QuoteTweet-fullname");
							[...quotedTweetSenderNameContainer.querySelectorAll(".Emoji")].map(x => x.remove());
							quotedTweetSenderName = escapeHtml(quotedTweetSenderNameContainer.textContent);
							quotedTweetSenderHandle = quotedTweetContainer.querySelector(".username > b").textContent;
							quotedTweetContent = quotedTweetContainer.querySelector(".QuoteTweet-text");
							quotedTweetHtml = (quotedTweetContent == null ? EMPTY_STRING : cleanUpHtml(quotedTweetContent).trim());
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
	const timer = setInterval(() => (ajaxResponse != null ? console.clear() : clearInterval(timer)), 15000);
})();
