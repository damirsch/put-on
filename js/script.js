const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")
let image = new Image()
let secondImage = null
let mouse = { clicked: false, startX: 0, startY: 0, imageStartX: 0, imageStartY: 0 }
let imagePosition = { x: 0, y: 0 }
let oldImageWidth
let oldImageHeight

document.getElementById("downloadButton").addEventListener("click", downloadCanvas)
// document.getElementById('flipButton').addEventListener('click', flipImage);
document.getElementById("removeImageButton").addEventListener("click", removeImage)

toggleButton()

function toggleButton() {
	const button = document.getElementById("downloadButton")
	if (secondImage === null) {
		button.textContent = "Add image"
		button.removeEventListener("click", downloadCanvas)
		button.addEventListener("click", uploadImage)
	} else {
		button.textContent = "Save image"
		button.removeEventListener("click", uploadImage)
		button.addEventListener("click", downloadCanvas)
	}
}

function removeImage() {
	c.clear()
	secondImage = null
	toggleButton()
	addDog()
}

function uploadImage() {
	const input = document.createElement("input")
	input.type = "file"
	input.accept = "image/*"
	input.onchange = function (e) {
		const file = e.target.files[0]
		const reader = new FileReader()
		reader.onload = function (event) {
			const imageUrl = event.target.result
			fabric.Image.fromURL(
				imageUrl,
				function (img) {
					img.set("isUploadedImage", true)
					const canvasWidth = canvas.width
					const canvasHeight = canvas.height
					const scaleFactor = Math.min(canvasWidth / img.width, canvasHeight / img.height)
					img.scale(scaleFactor * 2.17)
					img.set({
						left: (canvasWidth - img.width * img.scaleX) / 3.4,
						top: canvasHeight - img.height * img.scaleY + 500,
					})
					c.add(img)
					c.sendToBack(img)
					secondImage = img
					toggleButton()
				},
				{ crossOrigin: "anonymous" }
			)
		}
		reader.readAsDataURL(file)
	}

	input.click()
}

function downloadCanvas() {
	c.discardActiveObject()
	c.renderAll()
	var imageURL = canvas.toDataURL({
		format: "png",
		multiplier: 1,
	})
	var link = document.createElement("a")
	link.href = imageURL
	link.download = "canvas.png"
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

var c = new fabric.Canvas("canvas", {
	width: window.innerWidth > 425 ? 366 : 300,
	height: window.innerHeight > 425 ? 366 : 300,
})

c.on("mouse:wheel", function (opt) {
	opt.e.preventDefault()
	opt.e.stopPropagation()
	if (opt.e.ctrlKey) {
		var delta = opt.e.deltaY
		var zoom = c.getZoom()
		zoom *= 0.999 ** delta
		c.setZoom(zoom)
	} else {
		var e = opt.e
		var vpt = this.viewportTransform
		vpt[4] += e.deltaX
		vpt[5] += e.deltaY
		this.requestRenderAll()
	}
})

c.on("object:selected", function (event) {
	if (event.target && event.target.isType("image")) {
		if (event.target.get("isUploadedImage")) {
			c.sendToBack(event.target)
		}
	}
})

c.on("object:moving", function (event) {
	if (event.target && event.target.isType("image")) {
		if (event.target.get("isUploadedImage")) {
			c.sendToBack(event.target)
		}
	}
})

function addDog() {
	fabric.Image.fromURL(
		"./img/second-layer.png",
		function (img) {
			c.add(img)
			var scaleX = c.width / img.width
			var scaleY = c.height / img.height
			var minScale = Math.min(scaleX, scaleY)
			var left = (c.width - img.width * minScale) / 2
			var top = (c.height - img.height * minScale) / 2
			c.setViewportTransform([minScale, 0, 0, minScale, left, top])
		},
		{ crossOrigin: "anonymous" }
	)
}

function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

addDog()
