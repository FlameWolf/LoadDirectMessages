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
					* { box-sizing: border-box; }
					body { font-family: sans-serif; font-size: 12pt; font-weight: normal; font-style: normal; text-decoration: none; text-align: left; line-height: 18pt; background-color: #FFFFFF; color: #000000; min-width: 540pt; max-width: 1080pt; padding: 10pt; margin: 0 auto; }
					ul.tweets { display: flex; flex-direction: column; align-items: center; list-style-type: none; padding: 0; margin: 0; }
					ul.tweets > li { display: grid; grid-template-rows: auto auto; width: 50%; padding: 5pt 0; border-radius: 4pt; margin: 5pt 0; }
					ul.tweets > li.conversation-entry { display: block; text-align: center; background-color: #F4F4F4; margin: 50pt auto; }
					ul.tweets > li.conversation-entry > div.content { padding: 5pt; }
					ul.tweets > li.conversation-entry > div.content > span.members { display: flex; justify-content: center; margin-top: 6pt; }
					ul.tweets > li.conversation-entry > div.content > span.members > a.avatar { display: block; width: 25pt; height: 25pt; margin: auto 1pt; }
					ul.tweets > li.conversation-entry > div.content > span.members > a.avatar:first-child { margin-left: 0; }
					ul.tweets > li.conversation-entry > div.content > span.members > a.avatar:last-child { margin-right: 0; }
					ul.tweets > li.conversation-entry > div.content > span.members > a.avatar > img { width: 100%; height: 100%; border-radius: 50%; }
					ul.tweets > li.conversation-entry + li.conversation-entry { margin-top: -25pt; }
					ul.tweets > li.received { grid-template-columns: 33pt auto; align-self: flex-start; }
					ul.tweets > li.sent { grid-template-columns: auto 33pt; align-self: flex-end; }
					ul.tweets > li:first-child { margin-top: 0; }
					ul.tweets > li:last-child { margin-bottom: 0; }
					ul.tweets > li > a.avatar { display: block; }
					ul.tweets > li.received > a.avatar { grid-area: 1/1/3/2; margin-right: auto; }
					ul.tweets > li.sent > a.avatar { grid-area: -3/-1/-1/-2; margin-left: auto; }
					ul.tweets > li > a.avatar > img { width: 28pt; height: 28pt; border-radius: 50%; }
					ul.tweets > li.received > div.tweet { grid-area: 1/2/2/3; }
					ul.tweets > li.sent > div.tweet { grid-area: -3/-2/-2/-3; }
					ul.tweets > li > div.tweet > div.quote { cursor: pointer; }
					ul.tweets > li > div.tweet > div.quote, ul.tweets > li > div.tweet > div.hyperlink, ul.tweets > li > div.tweet > div.image > img, ul.tweets > li > div.tweet > div.video > video { border-style: solid; border-width: 1pt 1pt 0 1pt; border-color: #E6ECF0; border-radius: 4pt 4pt 0 0; }
					ul.tweets > li.sent > div.tweet > div.quote, ul.tweets > li.sent > div.tweet > div.hyperlink, ul.tweets > li.sent > div.tweet > div.image > img, ul.tweets > li.sent > div.tweet > div.video > video { border-color: #1DA1F2; }
					ul.tweets > li > div.tweet > div.quote > div.header { line-height: 12pt; padding: 5pt; color: #808080; font-size: smaller; border-bottom: solid 1pt #E6ECF0; margin-bottom: 1pt; }
					ul.tweets > li.sent > div.tweet > div.quote > div.header { border-color: #1DA1F2; }
					ul.tweets > li > div.tweet > div.quote > div.content { border-radius: 0; }
					ul.tweets > li > div.tweet > div.quote > div.content, ul.tweets > li > div.tweet > div.content { padding: 5pt; white-space: pre-wrap; overflow-wrap: break-word; }
					ul.tweets > li > div.tweet > div.quote > div.content > a, ul.tweets > li > div.tweet > div.content > a { color: #1C94E0; text-decoration: none; }
					ul.tweets > li > div.tweet > div.quote > div.content > a:hover, ul.tweets > li > div.tweet > div.content > a:hover { text-decoration: underline; }
					ul.tweets > li > div.tweet > div.quote:last-child, ul.tweets > li > div.tweet > div.image:last-child > img, ul.tweets > li > div.tweet > div.video:last-child > video { border-width: 1pt; border-radius: 4pt; }
					ul.tweets > li > div.tweet > div.hyperlink, ul.tweets > li > div.tweet > div.sticker { padding: 5pt; }
					ul.tweets > li.sent > div.tweet > div.sticker { text-align: right; }
					ul.tweets > li > div.tweet > div.sticker > img { width: 100pt; height: 100pt; }
					ul.tweets > li > div.tweet > div.image > img, ul.tweets > li > div.tweet > div.video > video { width: 100%; vertical-align: bottom; }
					ul.tweets > li > div.tweet > div.content { border-radius: 4pt }
					ul.tweets > li.received > div.tweet > div.content { background-color: #E6ECF0; }
					ul.tweets > li.sent > div.tweet > div.content { background-color: #1DA1F2; color: #FFFFFF; }
					ul.tweets > li.sent > div.tweet > div.content > a { color: #FFFFFF; text-decoration: underline; }
					ul.tweets > li.received > div.footer { grid-area: 2/2/3/3; }
					ul.tweets > li.sent > div.footer { grid-area: -2/-2/-1/-3; }
					ul.tweets > li > div.tweet > div.quote + div.content, ul.tweets > li > div.tweet > div.hyperlink + div.content, ul.tweets > li > div.sticker > div.quote + div.content, ul.tweets > li > div.tweet > div.image + div.content, ul.tweets > li > div.tweet > div.video + div.content { border-radius: 0 0 4pt 4pt; }
					ul.tweets > li > div.footer { padding: 5pt 0; color: #808080; font-size: smaller; }
					ul.tweets > li.sent > div.footer { text-align: right; }
					/*]]>*/
				</style>
			</head>
			<body>
				<ul class="tweets">
					<xsl:apply-templates select="tweets"/>
				</ul>
				<script type="text/javascript">
					/*<![CDATA[*/
					(function() {
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
						const updateFooter = function(value) {
							value.innerHTML = formatDate(new Date(parseInt(value.getAttribute("data-timestamp")) * 1000));
							value.removeAttribute("data-timestamp");
						};
						const updateQuote = function(value) {
							value.addEventListener("click", openTweetWindow);
						};
						[...document.querySelectorAll("div.footer")].forEach(x => setTimeout(() => updateFooter(x), 0));
						[...document.querySelectorAll("div.quote")].forEach(x => setTimeout(() => updateQuote(x), 0));
					})();
					/*]]>*/
				</script>
			</body>
		</html>
	</xsl:template>
	<xsl:template match="tweet">
		<xsl:variable name="sender" select="/conversation/participants/user[@id = current()/@sender]"/>
		<li>
			<xsl:attribute name="class">
				<xsl:choose>
					<xsl:when test="$sender">
						<xsl:choose>
							<xsl:when test="$sender/@self = 'true'">
								<xsl:text>sent</xsl:text>
							</xsl:when>
							<xsl:otherwise>
								<xsl:text>received</xsl:text>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>conversation-entry</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<xsl:apply-templates select="$sender"/>
			<xsl:choose>
				<xsl:when test="@sender">
					<xsl:if test="attachment|content">
						<div class="tweet">
							<xsl:apply-templates select="attachment"/>
							<xsl:apply-templates select="content"/>
						</div>
						<xsl:if test="@timestamp">
							<div class="footer">
								<xsl:attribute name="data-timestamp">
									<xsl:value-of select="@timestamp"/>
								</xsl:attribute>
							</div>
						</xsl:if>
					</xsl:if>
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="content"/>
				</xsl:otherwise>
			</xsl:choose>
		</li>
	</xsl:template>
	<xsl:template match="content">
		<div class="content">
			<xsl:copy-of select="node()"/>
		</div>
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
					<div class="content">
						<xsl:copy-of select="content/node()"/>
					</div>
				</xsl:when>
				<xsl:when test="@type = 'hyperlink'">
					<xsl:if test="not(../content)">
						<xsl:attribute name="class">
							<xsl:text>content</xsl:text>
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
	<xsl:template match="user">
		<a class="avatar" target="_blank">
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
</xsl:stylesheet>
