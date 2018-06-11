<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" encoding="UTF-8"/>
	<xsl:template match="conversation">
		<html>
			<head>
				<title>DM Conversation</title>
				<style type="text/css">
					/*<![CDATA[*/
					* { box-sizing: border-box; }
					body { font-family: sans-serif; font-size: 12pt; font-weight: normal; font-style: normal; text-decoration: none; text-align: left; background-color: #FFFFFF; color: #000000; min-width: 540pt; max-width: 1080pt; padding: 10pt; margin: 0 auto; }
					ul.tweets { list-style-type: none; padding: 0; margin: 0; display: flex; flex-direction: column; align-items: center; }
					ul.tweets > li { width: 50%; padding: 5pt; border-radius: 4pt; margin: 5pt; }
					ul.tweets > li.conversation-entry { background-color: #F4F4F4; text-align: center; margin: 50pt auto; }
					span.members { display: flex; justify-content: center; margin-top: 0.5em; }
					span.members > a.avatar { display: block; width: 25pt; height: 25pt; margin: auto 1pt; }
					span.members > a.avatar:first-child { margin-left: 0; }
					span.members > a.avatar:last-child { margin-right: 0; }
					span.members > a.avatar > img { width: 100%; height: 100%; border-radius: 50%; }
					ul.tweets > li.conversation-entry + li.conversation-entry { margin-top: -25pt; }
					ul.tweets > li.received { align-self: flex-start; }
					ul.tweets > li.sent { align-self: flex-end; }
					ul.tweets > li:first-child { margin-top: 0; }
					ul.tweets > li:last-child { margin-bottom: 0; }
					div.tweet-header { padding: 5pt; color: #808080; font-size: smaller; }
					ul.tweets > li.sent > div.tweet-header { text-align: right; }
					div.tweet-content { padding: 5pt; white-space: pre-wrap; overflow-wrap: break-word; border-radius: 4pt; }
					ul.tweets > li.received > div.tweet-content { background-color: #E6ECF0; }
					ul.tweets > li.sent > div.tweet-content { background-color: #1DA1F2; color: #FFFFFF; }
					ul.tweets > li > div.tweet-content a, ul.tweets > li > div.quote a, ul.tweets > li > div.hyperlink a { color: #1C94E0; text-decoration: none; }
					ul.tweets > li > div.tweet-content a:hover, ul.tweets > li > div.quote a:hover, ul.tweets > li > div.hyperlink a:hover { text-decoration: underline; }
					ul.tweets > li.sent > div.tweet-content a { color: #FFFFFF; text-decoration: underline; }
					div.quote { cursor: pointer; }
					div.hyperlink, div.sticker { padding: 5pt; }
					ul.tweets > li.sent > div.sticker { text-align: right; }
					div.sticker > img { height: 100pt; width: 100pt; }
					div.image > img, div.video > video { min-width: 100%; max-width: 100%; vertical-align: bottom; }
					div.quote, div.hyperlink, div.image > img, div.video > video { border-style: solid; border-width: 1pt 1pt 0 1pt; border-color: #E6ECF0; border-radius: 4pt 4pt 0 0; }
					ul.tweets > li.sent > div.quote, ul.tweets > li.sent > div.hyperlink, ul.tweets > li.sent > div.image > img, ul.tweets > li.sent > div.video > video { border-color: #1DA1F2; }
					div.quote:last-child, div.hyperlink:last-child, div.image:last-child > img, div.video:last-child > video { border-width: 1pt; border-radius: 4pt; }
					div.quote > div.tweet-header { border-bottom: solid 1pt #E6ECF0; margin-bottom: 1pt; }
					ul.tweets > li.sent > div.quote > div.tweet-header { border-color: #1DA1F2; }
					div.quote > div.tweet-content { border-radius: 0; }
					div.quote + div.tweet-content, div.hyperlink + div.tweet-content, div.image + div.tweet-content, div.video + div.tweet-content { border-radius: 0 0 4pt 4pt; }
					/*]]>*/
				</style>
				<script type="text/javascript">
					/*<![CDATA[*/
					const formatDate = (function() {
						const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
						const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
						return function(date) {
							return (days[date.getDay()] + " "
								+ date.getDate().toString().padStart(2, "0") + " "
								+ months[date.getMonth()] + " "
								+ date.getFullYear() + " "
								+ date.getHours().toString().padStart(2, "0") + ":"
								+ date.getMinutes().toString().padStart(2, "0") + ":"
								+ date.getSeconds().toString().padStart(2, "0"));
						};
					})();
					const openTweetWindow = function(event) {
						if(event.target.nodeName.toUpperCase() != "A")
							window.open(this.getAttribute("data-url"));
					};
					/*]]>*/
				</script>
			</head>
			<body>
				<ul class="tweets">
					<xsl:apply-templates select="tweet"/>
				</ul>
				<script type="text/javascript">
					/*<![CDATA[*/
					[...document.querySelectorAll("span.time")].map(x => x.innerHTML = formatDate(new Date(parseInt(x.getAttribute("data-timestamp")) * 1000)));
					[...document.querySelectorAll("div.quote")].map(x => x.addEventListener("click", openTweetWindow));
					/*]]>*/
				</script>
			</body>
		</html>
	</xsl:template>
	<xsl:template match="tweet">
		<li>
			<xsl:attribute name="class">
				<xsl:value-of select="@direction"/>
			</xsl:attribute>
			<xsl:choose>
				<xsl:when test="@direction">
					<div class="tweet-header">
						<xsl:apply-templates select="sender"/>
						<xsl:text>&#xA0;</xsl:text>
						<span class="time">
							<xsl:attribute name="data-timestamp">
								<xsl:value-of select="@timestamp"/>
							</xsl:attribute>
						</span>
					</div>
				</xsl:when>
				<xsl:otherwise>
					<xsl:attribute name="class">
						<xsl:text>conversation-entry</xsl:text>
					</xsl:attribute>
				</xsl:otherwise>
			</xsl:choose>
			<xsl:apply-templates select="attachment"/>
			<xsl:if test="content">
				<div class="tweet-content">
					<xsl:copy-of select="content/node()"/>
				</div>
			</xsl:if>
		</li>
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
						<xsl:value-of select="@tweet-id"/>
					</xsl:attribute>
					<div class="tweet-header">
						<xsl:apply-templates select="sender"/>
					</div>
					<div class="tweet-content">
						<xsl:copy-of select="content/node()"/>
					</div>
				</xsl:when>
				<xsl:when test="@type = 'hyperlink'">
					<xsl:if test="not(../content)">
						<xsl:attribute name="class">
							<xsl:text>tweet-content</xsl:text>
						</xsl:attribute>
					</xsl:if>
					<a target="_blank">
						<xsl:attribute name="href">
							<xsl:value-of select="@url"/>
						</xsl:attribute>
						<xsl:value-of select="@url"/>
					</a>
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
						<source type="video/mp4">
							<xsl:attribute name="src">
								<xsl:value-of select="@url"/>
							</xsl:attribute>
						</source>
					</video>
				</xsl:when>
			</xsl:choose>
		</div>
	</xsl:template>
	<xsl:template match="sender">
		<span class="sender">
			<xsl:attribute name="data-sender-id">
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
</xsl:stylesheet>
