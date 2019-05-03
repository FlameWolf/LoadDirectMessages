"use strict";
const loadDirectMessages = (function() {
	const emptyString = new String().valueOf();
	let conversationId = emptyString;
	let baseURL = emptyString;
	let conversationURL = emptyString;
	let tweetContainer = null;
	let tweetSenderId = emptyString;
	let tweetSenderHandle = emptyString;
	let tweetSenderAvatar = null;
	let tweetTimestamp = emptyString;
	let tweetContent = null;
	let tweetHTML = emptyString;
	let quotedTweetContainer = null;
	let quotedTweetId = emptyString;
	let quotedTweetSenderId = emptyString;
	let quotedTweetSenderHandle = emptyString;
	let quotedTweetSenderNameContainer = null;
	let quotedTweetSenderName = emptyString;
	let quotedTweetContent = null;
	let quotedTweetHTML = emptyString;
	let cardContainer = null;
	let imageContainer = null;
	let videoContainer = null;
	let attachmentType = emptyString;
	let attachmentURL = emptyString;
	let attachmentXML = emptyString;
	let cardURLs = new Array();
	let mediaURLs = new Array();
	let users = {};
	let selfUserId = emptyString;
	let result = emptyString;
	let paused = false;
	let stopped = false;
	let lastMessageTimeContainer = null;
	(function() {
		Object.defineProperty(Element.prototype, "replaceWith", {
			"value": function(html) {
				this.insertAdjacentHTML("afterend", html);
				this.remove();
			}
		});
	})();
	const parseHTML = (function() {
		const parser = new DOMParser();
		return function(html) {
			return parser.parseFromString(html, "text/html").body.children;
		};
	})();
	const removeElement = function(value) {
		value.remove();
	};
	const escapeHTML = function(html) {
		return html.replace(/&/g, "&#x26;").replace(/</g, "&#x3C;").replace(/>/g, "&#x3E;").replace(/"/g, "&#x22;").replace(/'/g, "&#x27;");
	};
	const formattingUtility = (function() {
		let hashtagLinkText = emptyString;
		let timelineLinkURL = emptyString;
		let mentionLinkText = emptyString;
		let conversationEntryHTML = emptyString;
		let conversationJoinEntry = null;
		let userProfileLink = null;
		let userProfileImage = null;
		const processHashtag = function(value) {
			hashtagLinkText = value.textContent;
			value.replaceWith(`<a class=\"hashtag\" href="https://twitter.com/hashtag/${hashtagLinkText.replace(/^#/, emptyString)}">${hashtagLinkText}</a>`);
		};
		const processHyperlink = function(value) {
			timelineLinkURL = (value.getAttribute("data-expanded-url") || `https://${value.textContent}`);
			value.replaceWith(`<a href="${timelineLinkURL}">${timelineLinkURL.replace(/^https?:\/\/(www\.)?/, emptyString)}</a>`);
		};
		const processMention = function(value) {
			mentionLinkText = value.textContent;
			value.replaceWith(`<a class="mention" href="https://twitter.com/${mentionLinkText.replace(/^@/, emptyString)}" data-user-id="${value.getAttribute("data-mentioned-user-id")}">${mentionLinkText}</a>`);
		};
		const processAvatar = function(value) {
			userProfileLink = value.querySelector("[class$=\"user-profile-link\"]");
			userProfileImage = value.querySelector(".DMAvatar-image");
			conversationEntryHTML += `<a class="avatar" href="${userProfileLink.href}" title="${userProfileImage.title}" data-user-id="${userProfileLink.getAttribute("data-user-id")}"><img src="${userProfileImage.src.replace(/_200x200\.jpg$/, "_400x400.jpg")}"/></a>`;
		};
		return Object.freeze({
			"cleanUpTweetHTML": function(element) {
				element.querySelectorAll(".twitter-hashtag").forEach(processHashtag);
				element.querySelectorAll(".twitter-timeline-link").forEach(processHyperlink);
				element.querySelectorAll(".twitter-atreply").forEach(processMention);
				return element.innerHTML.trim().replace(/&amp;/g, "&#x26;").replace(/&lt;/g, "&#x3C;").replace(/&gt;/g, "&#x3E;").replace(/&nbsp;/g, "&#xA0;").replace(/\n/g, "&#x0A;");
			},
			"cleanUpConversationEntryHTML": function(element) {
				conversationEntryHTML = element.firstChild.textContent.trim();
				conversationJoinEntry = element.querySelector(".DMConversationJoinEntry");
				if(conversationJoinEntry) {
					conversationEntryHTML += `<br/>${conversationJoinEntry.querySelector(".DMConversationJoinEntry-message").textContent.trim()}<br/><span class="members">`;
					conversationJoinEntry.querySelectorAll(".DMConversationJoinEntry-avatar").forEach(processAvatar);
					conversationEntryHTML = `${conversationEntryHTML}</span>`;
				}
				return conversationEntryHTML;
			},
			"resetVariables": function() {
				userProfileImage = null;
				userProfileLink = null;
				conversationJoinEntry = null;
				conversationEntryHTML = emptyString;
				mentionLinkText = emptyString;
				timelineLinkURL = emptyString;
				hashtagLinkText = emptyString;
			}
		});
	})();
	const finish = (function() {
		const generateUserXML = (function() {
			const transformJsonEntry = function([key, value]) {
				return `${key}="${value}"`;
			};
			return function([key, value]) {
				return `<user id="${key}" ${Object.entries(value).map(transformJsonEntry).join(" ")}/>`;
			};
		})();
		const saveXMLFile = function(fileName) {
			result = `<?xml version="1.0" encoding="UTF-8"?>\n<conversation id="${conversationId}"${selfUserId !== emptyString ? ` self="${selfUserId}"` : emptyString} basePath="${fileName}-Files/">\n<participants>\n${Object.entries(users).map(generateUserXML).join("\n")}\n</participants>\n<entries>\n${result.trim()}\n</entries>\n</conversation>`;
			let xmlFile = new Blob([result], { type: "text/xml" });
			let anchorElement = document.createElement("a");
			let anchorElementStyle = anchorElement.style;
			anchorElement.href = URL.createObjectURL(xmlFile);
			anchorElement.download = `${fileName}.xml`;
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
				lastMessageTimeContainer.parentElement.remove();
				lastMessageTimeContainer = null;
				stopped = false;
				paused = false;
				result = emptyString;
			});
		};
		return function() {
			saveXMLFile(`DM-Conversation-${conversationId}`);
			formattingUtility.resetVariables();
			selfUserId = emptyString;
			users = {};
			mediaURLs = new	Array();
			cardURLs = new Array();
			attachmentXML = emptyString;
			attachmentURL = emptyString;
			attachmentType = emptyString;
			videoContainer = null;
			imageContainer = null;
			cardContainer = null;
			quotedTweetHTML = emptyString;
			quotedTweetContent = null;
			quotedTweetSenderName = emptyString;
			quotedTweetSenderNameContainer = null;
			quotedTweetSenderHandle = emptyString;
			quotedTweetSenderId = emptyString;
			quotedTweetId = emptyString;
			quotedTweetContainer = null;
			tweetHTML = emptyString;
			tweetContent = null;
			tweetTimestamp = emptyString;
			tweetSenderAvatar = null;
			tweetSenderHandle = emptyString;
			tweetSenderId = emptyString;
			tweetContainer = null;
			conversationURL = emptyString;
			baseURL = emptyString;
			conversationId = emptyString;
		};
	})();
	const updateURLs = (function() {
		const checkIfNothingToUpdate = function() {
			if(cardURLs.length === 0 && mediaURLs.length === 0)
				finish();
			else
				lastMessageTimeContainer.previousSibling.remove();
		};
		const cardUtility = (function() {
			let previewImage = null;
			let defaultAttribute = emptyString;
			let blurbParagraph = null;
			let iconAttribute = emptyString;
			let footerText = emptyString;
			return Object.freeze({
				"updateCardXML": function(cardURL, expandedURL, cardContainer) {
					previewImage = cardContainer.querySelector(".tcu-imageWrapper > img");
					if(previewImage)
						defaultAttribute = emptyString;
					else {
						previewImage = new Image();
						previewImage.setAttribute("data-src", "https://ton.twimg.com/tfw/assets/news_stroke_v1_78ce5b21fb24a7c7e528d22fc25bd9f9df7f24e2.svg");
						defaultAttribute = ` default="true"`;
					}
					if(!cardContainer.querySelector(".MomentCard")) {
						blurbParagraph = cardContainer.querySelector(".SummaryCard-content > p");
						iconAttribute = emptyString;
						footerText = cardContainer.querySelector(".SummaryCard-destination").textContent;
					}
					else {
						blurbParagraph = cardContainer.querySelector(".MomentCard-description > p");
						iconAttribute = ` icon="https://ton.twimg.com/tfw/assets/lightning_v1_de331faee24508022200dae98bac0dc01db54f32.svg"`;
						footerText = cardContainer.querySelector(".MomentCard-badgeText").textContent;
					}
					result = result.replace(`url="${cardURL}"`, `url="${expandedURL}" layout="${previewImage.closest(".SummaryCard-image.TwitterCardsGrid-col--12") ? "column" : "row"}" preview="${escapeHTML(previewImage.getAttribute("data-src"))}"${defaultAttribute} header="${escapeHTML(cardContainer.querySelector(".TwitterCard-title").textContent)}"${blurbParagraph ? ` blurb="${escapeHTML(blurbParagraph.textContent)}"` : emptyString}${iconAttribute} footer="${escapeHTML(footerText)}"`);
				},
				"resetVariables": function() {
					footerText = emptyString;
					iconAttribute = emptyString;
					blurbParagraph = null;
					defaultAttribute = emptyString;
					previewImage = null;
				}
			});
		})();
		const updateCard = function(value, index, source) {
			fetch(`https://twitter.com/i/cards/tfw/v1/uri/${encodeURIComponent(value)}`).then(response => response.text().then(function(cardHTML) {
				fetch(value).then(response => response.text().then(function(responseText) {
					cardUtility.updateCardXML(value, responseText.match(/content="0;URL=(.*?)"/)[1], parseHTML(cardHTML)[0]);
					lastMessageTimeContainer.textContent = (`Fetching cards: ${source.length} remaining`);
				}).catch(ex => null).finally(function() {
					source.splice(source.indexOf(value), 1);
					if(source.length === 0) {
						cardUtility.resetVariables();
						checkIfNothingToUpdate();
					}
				}));
			}));
		};
		const updateMediaURL = function(value, index, source) {
			fetch(value, { "credentials": "include" }).then(function(response) {
				result = result.replace(`url="${value}"`, `url="${response.url}"`);
				lastMessageTimeContainer.textContent = (`Fetching media URLs: ${source.length} remaining`);
			}).catch(ex => null).finally(function() {
				source.splice(source.indexOf(value), 1);
				if(source.length === 0)
					checkIfNothingToUpdate();
			});
		};
		return function() {
			checkIfNothingToUpdate();
			cardURLs.forEach(updateCard);
			mediaURLs.forEach(updateMediaURL);
		};
	})();
	const processTweet = function([key, value]) {
		value = value.replace(/<img\s+.*?class="\s*Emoji\s*.*?".*?alt="(.*?)".*?>/g, "$1");
		tweetContainer = parseHTML(value)[0];
		if(tweetContainer.classList.contains("DirectMessage")) {
			tweetSenderId = tweetContainer.getAttribute("data-sender-id");
			tweetSenderHandle = tweetContainer.querySelector(".js-user-profile-link").getAttribute("href").replace(/^\//, emptyString);
			tweetSenderAvatar = tweetContainer.querySelector(".DMAvatar-image");
			tweetTimestamp = tweetContainer.querySelector("._timestamp").getAttribute("data-time");
			tweetContent = tweetContainer.querySelector(".DirectMessage-text .tweet-text");
			quotedTweetContainer = tweetContainer.querySelector(".QuoteTweet");
			cardContainer = tweetContainer.querySelector("[data-card-url]");
			imageContainer = tweetContainer.querySelector(".dm-attached-media");
			videoContainer = tweetContainer.querySelector(".PlayableMedia");
			tweetHTML = (tweetContent ? formattingUtility.cleanUpTweetHTML(tweetContent) : emptyString);
			if(quotedTweetContainer) {
				attachmentType = "tweet";
				quotedTweetId = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-item-id");
				quotedTweetSenderId = quotedTweetContainer.querySelector(".QuoteTweet-innerContainer").getAttribute("data-user-id");
				quotedTweetSenderHandle = quotedTweetContainer.querySelector(".username > b").textContent;
				quotedTweetSenderNameContainer = quotedTweetContainer.querySelector(".QuoteTweet-fullname");
				quotedTweetSenderNameContainer.querySelectorAll(".Emoji").forEach(removeElement);
				quotedTweetSenderName = escapeHTML(quotedTweetSenderNameContainer.textContent);
				quotedTweetContent = quotedTweetContainer.querySelector(".QuoteTweet-text");
				quotedTweetHTML = (quotedTweetContent ? formattingUtility.cleanUpTweetHTML(quotedTweetContent) : emptyString);
			}
			else if(cardContainer) {
				attachmentType = "card";
				attachmentURL = cardContainer.getAttribute("data-card-url");
				cardURLs.push(attachmentURL);
			}
			else if(imageContainer || videoContainer) {
				attachmentType = (imageContainer ? (tweetContainer.classList.contains("DirectMessage--sticker") ? "sticker" : "image") : "video");
				if(attachmentType == "sticker")
					attachmentURL = imageContainer.querySelector("img").src;
				else {
					attachmentURL = `https://mobile.twitter.com/messages/media/${key}`;
					mediaURLs.push(attachmentURL);
				}
			}
			else
				attachmentType = emptyString;
			switch(attachmentType) {
				case "tweet":
					attachmentXML = `<attachment type="${attachmentType}" id="${quotedTweetId}"><sender id="${quotedTweetSenderId}" handle="${quotedTweetSenderHandle}" name="${quotedTweetSenderName}"/><content>${quotedTweetHTML}</content></attachment>`;
					break;
				case "card":
				case "sticker":
				case "image":
				case "video":
					attachmentXML = `<attachment type="${attachmentType}" url="${attachmentURL}"/>`;
					break;
				default:
					attachmentXML = emptyString;
					break;
			}
			if(!users[tweetSenderId]) {
				users[tweetSenderId] = { "handle": tweetSenderHandle, "name": tweetSenderAvatar.title, "avatar": tweetSenderAvatar.src.replace(/_200x200.jpg$/, "_400x400.jpg") };
				if(tweetContainer.classList.contains("DirectMessage--sent"))
					selfUserId = tweetSenderId;
			}
			return `<tweet id="${key}" timestamp="${tweetTimestamp}" sender="${tweetSenderId}">${attachmentXML}${tweetHTML !== emptyString ? `<content>${tweetHTML}</content>` : emptyString}</tweet>`;
		}
		else
			return `<notification id="${key}"><content>${formattingUtility.cleanUpConversationEntryHTML(tweetContainer)}</content></notification>`;
	};
	const transformDMConversationHTML = (function() {
		const updateLastMessageTime = function() {
			lastMessageTimeContainer.textContent = (new Date(parseInt(tweetTimestamp) * 1000)).toString();
		};
		return function() {
			fetch(conversationURL, { "credentials": "include", "headers": { "X-Requested-With": "XMLHttpRequest" } }).then(response => response.json().then(function(data) {
				result = `${Object.entries(data.items).map(processTweet).join("\n")}\n${result}`;
				if(data.has_more && !stopped) {
					conversationURL = `${baseURL}&max_entry_id=${data.min_entry_id}`;
					if(!paused)
						transformDMConversationHTML();
				}
				else
					updateURLs();
				setTimeout(updateLastMessageTime);
			}));
		};
	})();
	const createStatusBar = function() {
		lastMessageTimeContainer = document.createElement("span");
		let pauseButton = document.createElement("button");
		let pauseButtonStyle = pauseButton.style;
		let stopButton = document.createElement("button");
		let statusBar = document.createElement("div");
		let statusBarStyle = statusBar.style;
		pauseButton.textContent = "Pause";
		pauseButton.onclick = function() {
			if(!paused) {
				paused = true;
				this.textContent = "Resume";
			}
			else {
				paused = false;
				this.textContent = "Pause";
				transformDMConversationHTML();
			}
		};
		pauseButtonStyle.padding = "0 0.5em";
		pauseButtonStyle.border = "double";
		stopButton.textContent = "Stop";
		stopButton.onclick = function() {
			stopped = true;
			this.disabled = stopped;
			this.previousElementSibling.disabled = stopped;
			this.textContent = "Wait …";
			if(paused)
				updateURLs();
		};
		stopButton.style.cssText = pauseButtonStyle.cssText;
		statusBarStyle.boxSizing = "border-box";
		statusBarStyle.backgroundColor = "#112233";
		statusBarStyle.color = "#FFFFFF";
		statusBarStyle.fontFamily = "monospace";
		statusBarStyle.textAlign = "center";
		statusBarStyle.width = "100%";
		statusBarStyle.padding = "1.5em";
		statusBarStyle.position = "fixed";
		statusBarStyle.bottom = "0";
		statusBarStyle.zIndex = "5000";
		lastMessageTimeContainer.textContent = "<EMPTY>";
		lastMessageTimeContainer.style.display = "contents";
		statusBar.appendChild(document.createTextNode("Last message time: "));
		statusBar.appendChild(lastMessageTimeContainer);
		statusBar.appendChild(document.createTextNode(" "));
		statusBar.appendChild(pauseButton);
		statusBar.appendChild(document.createTextNode(" "));
		statusBar.appendChild(stopButton);
		document.body.appendChild(statusBar);
		statusBarStyle = null;
		statusBar = null;
		stopButton = null;
		pauseButtonStyle = null;
		pauseButton = null;
	};
	return function(id) {
		conversationId = id;
		baseURL = `https://twitter.com/messages/with/conversation?id=${conversationId}`;
		conversationURL = baseURL;
		createStatusBar();
		transformDMConversationHTML();
	};
})();