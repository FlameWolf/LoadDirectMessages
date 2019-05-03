<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="UTF-8"/>
	<xsl:template match="conversation">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>
					<xsl:text>DM Conversation: </xsl:text>
					<xsl:for-each select="participants/user">
						<xsl:value-of select="@name"/>
						<xsl:if test="following-sibling::user">
							<xsl:text>, </xsl:text>
						</xsl:if>
					</xsl:for-each>
				</title>
				<style type="text/css">
					/*<![CDATA[*/
					* { box-sizing: border-box }
					body { background-color: #FFFFFF; color: #000000; font-family: sans-serif; font-size: 12pt; font-weight: normal; font-style: normal; text-decoration: none; text-align: left; line-height: 18pt; min-width: 540pt; max-width: 1080pt; padding: 10pt; margin: 0 auto }
					ul.tweets { display: flex; flex-direction: column; align-items: center; list-style-type: none; padding: 0; margin: 0 }
					ul.tweets > li { display: grid; grid-template-rows: auto auto; width: 50%; padding: 5pt 0; margin: 5pt 0 }
					ul.tweets > li.notification { display: block; text-align: center; margin: 50pt auto }
					ul.tweets > li.notification > div.content { background-color: #F4F4F4; padding: 10pt 5pt; border-radius: 4pt }
					ul.tweets > li.notification > div.content > span.members { display: flex; justify-content: center; flex-wrap: wrap; margin-top: 6pt }
					ul.tweets > li.notification > div.content > span.members > a.avatar { display: block; width: 25pt; height: 25pt; margin: 1pt }
					ul.tweets > li.notification > div.content > span.members > a.avatar > img { width: 100%; height: 100%; border-radius: 50% }
					ul.tweets > li.notification + li.notification { margin-top: -25pt }
					ul.tweets > li.received { grid-template-columns: 33pt auto; align-self: flex-start }
					ul.tweets > li.sent { grid-template-columns: auto 33pt; align-self: flex-end }
					ul.tweets > li.grouped { padding-bottom: 0; margin-bottom: 0 }
					ul.tweets > li.grouped + li { padding-top: 0; margin-top: 1pt }
					ul.tweets > li:first-child { margin-top: 0 }
					ul.tweets > li:last-child { margin-bottom: 0 }
					ul.tweets > li > a.avatar { display: block; width: 28pt; height: 28pt; position: relative }
					ul.tweets > li.received > a.avatar { grid-area: 1/1/3/2; margin-right: auto }
					ul.tweets > li.sent > a.avatar { grid-area: -3/-1/-1/-2; margin-left: auto }
					ul.tweets > li.grouped + li > a.avatar { display: none }
					ul.tweets > li > a.avatar > img { width: 100%; height: 100%; top: 0; right: 0; bottom: 0; left: 0; border-radius: 50%; position: absolute }
					ul.tweets > li > div.tweet { position: relative }
					ul.tweets > li.received > div.tweet { grid-area: 1/2/2/3 }
					ul.tweets > li.sent > div.tweet { grid-area: -3/-2/-2/-3 }
					ul.tweets > li > div.tweet > div.quote { cursor: pointer }
					ul.tweets > li > div.tweet > div.quote, ul.tweets > li > div.tweet > div.card, ul.tweets > li > div.tweet > div.image, ul.tweets > li > div.tweet > div.video { border-style: solid; border-width: 1pt 1pt 0 1pt; border-color: #E6ECF0; border-radius: 4pt 4pt 0 0; overflow: hidden }
					ul.tweets > li.sent > div.tweet > div.quote, ul.tweets > li.sent > div.tweet > div.card, ul.tweets > li.sent > div.tweet > div.image, ul.tweets > li.sent > div.tweet > div.video { border-color: #1DA1F2 }
					ul.tweets > li > div.tweet > div.quote > div.header { color: #8899A6; font-size: smaller; line-height: 12pt; padding: 5pt; border-bottom: solid 1pt #E6ECF0 }
					ul.tweets > li.sent > div.tweet > div.quote > div.header { border-color: #1DA1F2 }
					ul.tweets > li > div.tweet > div.quote > div.content { border-radius: 0 }
					ul.tweets > li > div.tweet > div.quote > div.content, ul.tweets > li > div.tweet > div.content { white-space: pre-wrap; overflow-wrap: break-word; padding: 5pt }
					ul.tweets > li > div.tweet > div.quote > div.content > a, ul.tweets > li > div.tweet > div.content > a { color: #1C94E0; text-decoration: none }
					ul.tweets > li > div.tweet > div.quote > div.content > a:hover, ul.tweets > li > div.tweet > div.content > a:hover { text-decoration: underline }
					ul.tweets > li > div.tweet > div.quote:last-child, ul.tweets > li > div.tweet > div.card:last-child, ul.tweets > li > div.tweet > div.image:last-child, ul.tweets > li > div.tweet > div.video:last-child { border-width: 1pt; border-radius: 4pt }
					ul.tweets > li > div.tweet > div.card { display: flex; cursor: pointer }
					ul.tweets > li > div.tweet > div.card.row { flex-direction: row }
					ul.tweets > li > div.tweet > div.card.column { flex-direction: column }
					ul.tweets > li > div.tweet > div.card > div.preview { border-width: 1pt; border-color: #E6ECF0; overflow: hidden }
					ul.tweets > li.sent > div.tweet > div.card > div.preview { border-color: #1DA1F2 }
					ul.tweets > li > div.tweet > div.card.row > div.preview { min-width: 100pt; max-width: 25%; border-right-style: solid; position: relative }
					ul.tweets > li > div.tweet > div.card.row > div.preview > img { height: 100%; position: absolute; left: 50%; transform: translateX(-50%) }
					ul.tweets > li > div.tweet > div.card.column > div.preview { border-bottom-style: solid }
					ul.tweets > li > div.tweet > div.card.column > div.preview > img { vertical-align: bottom; width: 100% }
					ul.tweets > li > div.tweet > div.card > div.preview.default > img { height: unset; top: 50%; transform: translate3d(-50%, -50%, 0) }
					ul.tweets > li > div.tweet > div.card > div.content { padding: 5pt }
					ul.tweets > li > div.tweet > div.card > div.content > h4.header, ul.tweets > li > div.tweet > div.card > div.content > p.blurb { margin-top: 0; margin-bottom: 5pt }
					ul.tweets > li > div.tweet > div.card > div.content > div.footer { color: #8899A6 }
					ul.tweets > li > div.tweet > div.card > div.content > div.footer > img:first-child { vertical-align: sub; height: 12pt; margin-right: 5pt }
					ul.tweets > li > div.tweet > div.sticker { padding: 5pt }
					ul.tweets > li.sent > div.tweet > div.sticker { text-align: right }
					ul.tweets > li > div.tweet > div.sticker > img { width: 100pt; height: 100pt }
					ul.tweets > li > div.tweet > div.image > img, ul.tweets > li > div.tweet > div.video > video { vertical-align: bottom; width: 100% }
					ul.tweets > li > div.tweet > div.content { border-radius: 4pt }
					ul.tweets > li.received > div.tweet > div.content { background-color: #E6ECF0 }
					ul.tweets > li.sent > div.tweet > div.content { background-color: #1DA1F2; color: #FFFFFF }
					ul.tweets > li.sent > div.tweet > div.content > a { color: #FFFFFF; text-decoration: underline }
					ul.tweets > li > div.tweet > div.quote + div.content, ul.tweets > li > div.tweet > div.card + div.content, ul.tweets > li > div.sticker > div.quote + div.content, ul.tweets > li > div.tweet > div.image + div.content, ul.tweets > li > div.tweet > div.video + div.content { border-radius: 0 0 4pt 4pt }
					ul.tweets > li > div.tweet:after { content: attr(data-time); display: block; color: #8899A6; font-size: smaller; padding: 5pt 0 }
					ul.tweets > li.received > div.tweet:after { grid-area: 2/2/3/3 }
					ul.tweets > li.sent > div.tweet:after { grid-area: -2/-2/-1/-3; text-align: right }
					ul.tweets > li.grouped > div.tweet:after { display: none }
					ul.tweets > li.grouped > div.tweet:hover:after { display: unset; width: 100%; position: absolute; top: 0 }
					ul.tweets > li.received.grouped > div.tweet:hover:after { content: "•\0000A0\0000A0"attr(data-time); left: calc(100% + 10pt) }
					ul.tweets > li.sent.grouped > div.tweet:hover:after { content: attr(data-time)"\0000A0\0000A0•"; right: calc(100% + 10pt) }
					/*]]>*/
				</style>
				<base target="_blank">
					<xsl:attribute name="href">
						<xsl:value-of select="@basePath"/>
					</xsl:attribute>
				</base>
			</head>
			<body>
				<ul class="tweets">
					<xsl:apply-templates select="entries"/>
				</ul>
				<script type="application/javascript">
					/*<![CDATA[*/
					"use strict";
					(function() {
						const formatDate = (function() {
							const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
							const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
							return function(date) {
								return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]} ${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
							};
						})();
						const updateTweetFooter = (function() {
							const setTimeAttribute = function(element) {
								element.dataset["time"] = formatDate(new Date(parseInt(element.dataset.timestamp) * 1000));
								delete element.dataset.timestamp;
							};
							return function(value) {
								setTimeout(setTimeAttribute, 0, value);
							};
						})();
						const updateJavaScriptLink = (function() {
							const openWindow = function(event) {
								if(event.target.nodeName.toUpperCase() !== "A")
									window.open(this.dataset.url);
							};
							const addClickEventListener = function(element) {
								element.addEventListener("click", openWindow);
							};
							return function(value) {
								setTimeout(addClickEventListener, 0, value);
							};
						})();
						document.querySelectorAll("ul.tweets > li > div.tweet").forEach(updateTweetFooter);
						document.querySelectorAll("[data-url]").forEach(updateJavaScriptLink);
					})();
					/*]]>*/
				</script>
			</body>
		</html>
	</xsl:template>
	<xsl:template match="notification">
		<li class="notification">
			<xsl:apply-templates select="content"/>
		</li>
	</xsl:template>
	<xsl:template match="tweet">
		<li>
			<xsl:attribute name="class">
				<xsl:choose>
					<xsl:when test="@sender = /conversation/@self">
						<xsl:text>sent</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>received</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
				<xsl:call-template name="grouping">
					<xsl:with-param name="nextTweet" select="following-sibling::*[1]"/>
				</xsl:call-template>
			</xsl:attribute>
			<xsl:apply-templates select="/conversation/participants/user[@id = current()/@sender]"/>
			<div class="tweet">
				<xsl:attribute name="data-timestamp">
					<xsl:value-of select="@timestamp"/>
				</xsl:attribute>
				<xsl:apply-templates select="attachment"/>
				<xsl:apply-templates select="content"/>
			</div>
		</li>
	</xsl:template>
	<xsl:template name="grouping">
		<xsl:param name="nextTweet"/>
		<xsl:if test="name($nextTweet) = 'tweet'">
			<xsl:if test="($nextTweet/@sender = @sender) and (($nextTweet/@timestamp - @timestamp) &#x3C; 60)">
				<xsl:text> </xsl:text>
				<xsl:text>grouped</xsl:text>
			</xsl:if>
		</xsl:if>
	</xsl:template>
	<xsl:template match="user">
		<a class="avatar">
			<xsl:attribute name="href">
				<xsl:text>https://twitter.com/</xsl:text>
				<xsl:value-of select="@handle"/>
			</xsl:attribute>
			<xsl:attribute name="title">
				<xsl:value-of select="@name"/>
			</xsl:attribute>
			<xsl:attribute name="data-user-id">
				<xsl:value-of select="@id"/>
			</xsl:attribute>
			<img>
				<xsl:attribute name="src">
					<xsl:value-of select="@avatar"/>
				</xsl:attribute>
			</img>
		</a>
	</xsl:template>
	<xsl:template match="attachment">
		<div>
			<xsl:attribute name="class">
				<xsl:value-of select="@type"/>
			</xsl:attribute>
			<xsl:choose>
				<xsl:when test="@type = 'tweet'">
					<xsl:attribute name="class">
						<xsl:text>quote</xsl:text>
					</xsl:attribute>
					<xsl:attribute name="data-url">
						<xsl:text>https://twitter.com/</xsl:text>
						<xsl:value-of select="sender/@handle"/>
						<xsl:text>/status/</xsl:text>
						<xsl:value-of select="@id"/>
					</xsl:attribute>
					<div class="header">
						<xsl:apply-templates select="sender"/>
					</div>
					<xsl:apply-templates select="content"/>
				</xsl:when>
				<xsl:when test="@type = 'card'">
					<xsl:attribute name="class">
						<xsl:value-of select="@type"/>
						<xsl:text> </xsl:text>
						<xsl:value-of select="@layout"/>
					</xsl:attribute>
					<xsl:attribute name="data-url">
						<xsl:value-of select="@url"/>
					</xsl:attribute>
					<div>
						<xsl:attribute name="class">
							<xsl:text>preview</xsl:text>
							<xsl:if test="@default = 'true'">
								<xsl:text> </xsl:text>
								<xsl:text>default</xsl:text>
							</xsl:if>
						</xsl:attribute>
						<img>
							<xsl:attribute name="src">
								<xsl:value-of select="@preview"/>
							</xsl:attribute>
						</img>
					</div>
					<div class="content">
						<h4 class="header">
							<xsl:value-of select="@header"/>
						</h4>
						<xsl:if test="@blurb">
							<p class="blurb">
								<xsl:value-of select="@blurb"/>
							</p>
						</xsl:if>
						<div class="footer">
							<xsl:if test="@icon">
								<img>
									<xsl:attribute name="src">
										<xsl:value-of select="@icon"/>
									</xsl:attribute>
								</img>
							</xsl:if>
							<xsl:value-of select="@footer"/>
						</div>
					</div>
				</xsl:when>
				<xsl:when test="@type = 'sticker' or @type = 'image'">
					<img>
						<xsl:attribute name="src">
							<xsl:value-of select="@url"/>
						</xsl:attribute>
					</img>
				</xsl:when>
				<xsl:when test="@type = 'video'">
					<video controls="true">
						<xsl:attribute name="src">
							<xsl:value-of select="@url"/>
						</xsl:attribute>
					</video>
				</xsl:when>
			</xsl:choose>
		</div>
	</xsl:template>
	<xsl:template match="sender">
		<span class="sender">
			<xsl:attribute name="data-user-id">
				<xsl:value-of select="@id"/>
			</xsl:attribute>
			<strong class="name">
				<xsl:value-of select="@name"/>
			</strong>
			<xsl:text>&#xA0;</xsl:text>
			<em class="handle">
				<xsl:text>@</xsl:text>
				<xsl:value-of select="@handle"/>
			</em>
		</span>
	</xsl:template>
	<xsl:template match="content">
		<div class="content">
			<xsl:copy-of select="node()"/>
		</div>
	</xsl:template>
</xsl:stylesheet>