function getAmazonData() {
	return new Promise(function(resolve,reject) {
		chrome.tabs.query({active:true, currentWindow: true}, function(tabs) {
			// Get URL of current Tab 
			var currentTab = tabs[0]
			var currentUrl = new URL(currentTab.url)
			// Get product ID from Amazon URL
			if (currentUrl.hostname == "www.amazon.com") {
				let urlArray = currentTab.url.split("/")
				for (i = 0; i < urlArray.length; i++) {
					if (urlArray[i] == "dp") {
						var productID = urlArray[i+1].slice(0,10)
						document.getElementById("amazonButton").textContent = productID
					}
					else if (urlArray[i] == "gp") {
						var productID = urlArray[i+2].slice(0,10)
						document.getElementById("amazonButton").textContent = productID
					}
				}
				// Get current price
				if (productID != undefined) {
					// DOM sesarch on current tab to find price
					chrome.tabs.executeScript(currentTab.id, {"code":"document.getElementById(\"tp_price_block_total_price_ww\").firstChild.innerText"}, function(result) {
						// If price not found
						if (result[0] == null) {
							var price = "Price not available"
						}
						else {
							var price = result[0]
						}
						// if (result[0] == null) {
						// 	document.getElementById("currentPrice").textContent = "Price not available"
						// }
						// else {
						// 	document.getElementById("currentPrice").textContent = result[0]
						// }
						// Resolve promise
						resolve([productID, price])
					})
				}
				else {
					reject(new Error("Product not found!"))
				}
			}
		})


	})
}

async function getDisplayData() {
	// Await resolved Promise containing Amazon product ID
	var productData = await getAmazonData()
	var productID = productData[0]
	var currPrice = productData[1]
	document.getElementById("currentPrice").textContent = currPrice
	// Load page data from CamelCamelCamel
	$.get('https://camelcamelcamel.com/product/' + productID, function(response) {
		// Set link target
		document.getElementById("camelLink").href = "https://camelcamelcamel.com/product/" + productID
		// Regex search for lowest price
		var lowestPrice = response.match(/x-camel-price="(.*?)" x-camel-id="price_amazon" x-camel-label="Best Price"/)
		if (lowestPrice == null) {
			if (response.match(/Our system thinks the current price is a best price/)) {
				document.getElementById("lowestPrice").textContent = 'Current price is the best price!'
				document.getElementById("priceDiff").textContent = '-'
			}
			else {
				document.getElementById("lowestPrice").textContent = "Best price not available";
				document.getElementById("priceDiff").textContent = "-"
			}
		}
		else {
			var table = $(response).find('table')
			var lowest_date = (table[1].getElementsByClassName('lowest_price'))[0].children[2].textContent
			document.getElementById("lowestPrice").textContent = `$${lowestPrice[1]} (${lowest_date})`
			if (currPrice != "Price not available" && currPrice != "") {
				let priceFlt = parseFloat(currPrice.slice(1))
				let priceDifference = priceFlt - parseFloat(lowestPrice[1])
				let pricePercent = (priceDifference / lowestPrice[1]) * 100
				document.getElementById('priceDiff').textContent = `+$${priceDifference.toFixed(2)} (Currently ${pricePercent.toFixed(2)}% higher than the lowest price)`
			}
			else {
				document.getElementById('priceDiff').textContent = "-"
				
			}
		}
	})
	$.get('https://reviewmeta.com/amazon/' + productID, function(response) {
		document.getElementById("metaLink").href = 'https://reviewmeta.com/amazon/' + productID
		var reviewScore = response.match(/id="adjusted-rating-large">(.*?)<\/span>/)
		// If element not found, score is not available at ReviewMeta
		if (reviewScore == null) {
			document.getElementById("reviewScore").textContent = "Score not available";
		}
		else {
			// Get review score, select appropriate DOM element
			let reviewScoreNum = reviewScore[1]
			let reviewScoreSpan = document.getElementById("reviewScore")
			reviewScoreSpan.textContent = reviewScoreNum
			reviewScoreSpan.style.fontWeight = "bold";
			// Color code review score
			if (reviewScoreNum >= 4.5) {
				reviewScoreSpan.style.color = "green";
			}
			else if (reviewScoreNum >= 4) {
				reviewScoreSpan.style.color = "orange";
			}
			else {
				reviewScoreSpan.style.color = "red";
			}
		}
	})
}

getDisplayData()

