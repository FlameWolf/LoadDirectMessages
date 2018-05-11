<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" encoding="UTF-8"/>
	<xsl:strip-space elements="*"/>
	<xsl:template match="conversation">
		<html>
			<head>
				<title>DM Conversation</title>
				<style type="text/css">
					/*<![CDATA[*/
					body { font-family: sans-serif; font-weight: normal; font-style: normal; text-decoration: none; background-color: #FFFFFF; color: #000000; }
					ul.tweets { list-style-type: none; }
					ul.tweets > li { padding: 5px; width: 50%; clear: both; border-radius: 4px; margin: 5px; }
					ul.tweets > li.received { float: left; }
					ul.tweets > li.sent { float: right; }
					div.tweet-header { padding: 5px; }
					div.tweet-header, div.quote-header { color: #808080; font-size: smaller; }
					div.tweet-content, div.sticker { padding: 5px; border-radius: 4px; }
					div.tweet-content > img.image { max-height: 250px; max-width: 250px; }
					div.sticker > img { max-height: 100px; max-width: 100px; }
					ul.tweets > li.received > div.tweet-content { background-color: #E6ECF0; }
					ul.tweets > li.sent > div.tweet-content { background-color: #1DA1F2; color: #FFFFFF; }
					ul.tweets > li.received > div.tweet-content > a { color: #1C94E0; text-decoration: none; }
					ul.tweets > li.received > div.tweet-content > a:hover { text-decoration: underline; }
					ul.tweets > li.sent > div.tweet-content > a { color: #FFFFFF; text-decoration: underline; }
					a.quote { display: block; border: solid 1px #F0F0F0; border-top-left-radius: 4px; border-top-right-radius: 4px; padding: 5px; text-decoration: none; color: #000000; }
					a.quote:last-child { border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; }
					a.quote + div.tweet-content { border-top-left-radius: 0; border-top-right-radius: 0; }
					ul.tweets > li.sent div.tweet-header { text-align: right; }
					/*]]>*/
				</style>
				<script type="text/javascript">
					/*<![CDATA[*/
					var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
					var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
					var formatDate = function(date) {
						return (days[date.getDay()] + " "
							+ date.getDate().toString().padStart(2, "0") + " "
							+ months[date.getMonth()] + " "
							+ date.getFullYear() + " "
							+ date.getHours().toString().padStart(2, "0") + ":"
							+ date.getMinutes().toString().padStart(2, "0") + ":"
							+ date.getSeconds().toString().padStart(2, "0"));
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
					[...document.querySelectorAll("a.quote")].map(function(value, index, array) {
						var status = value.getAttribute("data-status-id");
						var handle = value.querySelector("span.sender em.handle").innerText.replace(/^@/, "");
						value.href = `https://twitter.com/${handle}/status/${status}`;
					});
					[...document.querySelectorAll("span.time")].map(x => x.innerHTML = formatDate(new Date(parseInt(x.getAttribute("data-timestamp")) * 1000)));
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
			<div class="tweet-header">
				<xsl:apply-templates select="sender"/>
				<xsl:text>&#xA0;</xsl:text>
				<span class="time">
					<xsl:attribute name="data-timestamp">
						<xsl:value-of select="@timestamp"/>
					</xsl:attribute>
				</span>
			</div>
			<xsl:apply-templates select="quote"/>
			<xsl:if test="content != '' or content/node()">
				<div class="tweet-content">
					<xsl:if test="content/img/@class='sticker'">
						<xsl:attribute name="class">
							<xsl:text>sticker</xsl:text>
						</xsl:attribute>
					</xsl:if>
					<xsl:copy-of select="content/node()"/>
				</div>
			</xsl:if>
		</li>
	</xsl:template>
	<xsl:template match="quote">
		<a class="quote" target="_blank">
			<xsl:attribute name="data-status-id">
				<xsl:value-of select="@id"/>
			</xsl:attribute>
			<div class="quote-header">
				<xsl:apply-templates select="sender"/>
			</div>
			<div class="quote-content">
				<xsl:copy-of select="content/node()"/>
			</div>
		</a>
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
				<xsl:value-of select="@handle"/>
			</em>
		</span>
	</xsl:template>
</xsl:stylesheet>
