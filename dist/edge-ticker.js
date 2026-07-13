//#region src/defaults.ts
var e = {
	backgroundPaddingX: 12,
	backgroundRadius: 7,
	font: {
		family: "EdgeTickerSans",
		fallback: "Inter, ui-sans-serif, system-ui, sans-serif",
		lineHeight: 66,
		size: 48,
		style: "normal",
		weight: 700
	},
	letterSpacing: 1.5,
	stripPaddingX: 28,
	stripPaddingY: 18,
	cornerRadius: 86,
	direction: "reverse",
	edgePadding: 24,
	exitOverscan: {
		start: 0,
		end: -.5
	},
	repeatTexture: !0,
	repeatWindowCopies: 2,
	scrollLaps: 1,
	scrollPadding: {
		start: 0,
		end: 0
	},
	columnStep: 2,
	rowStep: 3,
	distortion: {
		enabled: !0,
		repeatX: 8,
		repeatY: 1,
		scrollWithText: !1,
		strengthAlong: 8,
		strengthAcross: 10
	},
	runs: [
		{
			text: " START ",
			background: "#111111",
			fontWeight: 900,
			punchOut: !0
		},
		{
			text: "     This is the text that ends here.    ",
			fill: "#111111",
			fontWeight: 700
		},
		{
			text: " END ",
			background: "#ff6b57",
			fontWeight: 900,
			punchOut: !0
		}
	]
};
function t(e, t = {}) {
	return {
		...e,
		...t,
		edgePadding: n(e.edgePadding, t.edgePadding),
		font: {
			...e.font,
			...t.font
		},
		exitOverscan: {
			...e.exitOverscan,
			...t.exitOverscan
		},
		scrollPadding: {
			...e.scrollPadding,
			...t.scrollPadding
		},
		distortion: {
			...e.distortion,
			...t.distortion
		},
		runs: t.runs ?? e.runs
	};
}
function n(e, t) {
	if (t === void 0 || typeof t == "number") return t ?? e;
	let n = r(e), i = t.x, a = t.y;
	return {
		top: t.top ?? a ?? n.top,
		right: t.right ?? i ?? n.right,
		bottom: t.bottom ?? a ?? n.bottom,
		left: t.left ?? i ?? n.left
	};
}
function r(e) {
	if (typeof e == "number") return {
		top: e,
		right: e,
		bottom: e,
		left: e
	};
	let t = e.x ?? 0, n = e.y ?? 0;
	return {
		top: e.top ?? n,
		right: e.right ?? t,
		bottom: e.bottom ?? n,
		left: e.left ?? t
	};
}
//#endregion
//#region src/utils.ts
function i(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function a(e) {
	if (typeof e != "string") return e;
	let t = document.querySelector(e);
	if (!t) throw Error(`Missing required element: ${e}`);
	return t;
}
function o(e) {
	let t = e.getContext("2d");
	if (!t) throw Error("Could not create 2D canvas context");
	return t;
}
function s(e) {
	let t = e.getContext("webgl2", {
		alpha: !0,
		antialias: !0,
		premultipliedAlpha: !0
	});
	if (!t) throw Error("Could not create WebGL2 context");
	return t;
}
function c(e, t, n) {
	let r = f(e.createShader(t), "shader");
	if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) {
		let t = e.getShaderInfoLog(r) || "Unknown shader error";
		throw e.deleteShader(r), Error(t);
	}
	return r;
}
function l(e, t, n) {
	let r = f(e.createProgram(), "program");
	if (e.attachShader(r, t), e.attachShader(r, n), e.linkProgram(r), !e.getProgramParameter(r, e.LINK_STATUS)) {
		let t = e.getProgramInfoLog(r) || "Unknown program link error";
		throw e.deleteProgram(r), Error(t);
	}
	return e.deleteShader(t), e.deleteShader(n), r;
}
function u(e, t, n) {
	let r = e.getUniformLocation(t, n);
	if (!r) throw Error(`Missing WebGL uniform: ${n}`);
	return r;
}
function d(e, t, n) {
	let r = e.getAttribLocation(t, n);
	if (r < 0) throw Error(`Missing WebGL attribute: ${n}`);
	return r;
}
function f(e, t) {
	if (!e) throw Error(`Could not create WebGL ${t}`);
	return e;
}
//#endregion
//#region src/geometry.ts
function p(e, t, n, r) {
	let a = n.font.lineHeight + n.stripPaddingY * 2, o = m(n.edgePadding), s = a / 2, c = o.left + s, l = o.top + s, u = e - o.right - s, d = t - o.bottom - s, f = i(n.cornerRadius, 12, Math.max(12, Math.min((u - c) / 2, (d - l) / 2) - 1)), p = [
		h(u, -r.start, u, d - f),
		g(u - f, d - f, f, 0, Math.PI / 2),
		h(u - f, d, c + f, d),
		g(c + f, d - f, f, Math.PI / 2, Math.PI),
		h(c, d - f, c, l + f),
		g(c + f, l + f, f, Math.PI, Math.PI * 1.5),
		h(c + f, l, e + r.end, l)
	];
	return {
		length: p.reduce((e, t) => e + t.length, 0),
		segments: p
	};
}
function m(e) {
	if (typeof e == "number") return {
		top: e,
		right: e,
		bottom: e,
		left: e
	};
	let t = e.x ?? 0, n = e.y ?? 0;
	return {
		top: e.top ?? n,
		right: e.right ?? t,
		bottom: e.bottom ?? n,
		left: e.left ?? t
	};
}
function h(e, t, n, r, i) {
	let a = n - e, o = r - t, s = Math.hypot(a, o), c = a / s, l = o / s, u = i ? x(i.x, i.y) : {
		x: -l,
		y: c
	};
	return {
		kind: "line",
		length: s,
		nx: u.x,
		ny: u.y,
		tx: c,
		ty: l,
		x1: e,
		x2: n,
		y1: t,
		y2: r
	};
}
function g(e, t, n, r, i) {
	let a = i - r;
	return {
		kind: "arc",
		centerX: e,
		centerY: t,
		direction: Math.sign(a),
		endAngle: i,
		length: Math.abs(a) * n,
		radius: n,
		startAngle: r
	};
}
function _(e, t, n) {
	let r = v(e, n.columnStep), i = Math.max(2, Math.ceil(t.cssHeight / n.rowStep)), a = [];
	for (let e = 0; e < r.length - 1; e += 1) {
		let n = r[e], o = r[e + 1];
		for (let e = 0; e < i; e += 1) {
			let r = e / i * t.cssHeight, s = (e + 1) / i * t.cssHeight;
			y(a, n, r, t), y(a, o, r, t), y(a, n, s, t), y(a, n, s, t), y(a, o, r, t), y(a, o, s, t);
		}
	}
	return new Float32Array(a);
}
function v(e, t) {
	let n = [], r = 0;
	return e.segments.forEach((e) => {
		let i = e.kind === "arc" ? Math.max(1, Math.ceil(e.length / t)) : 1;
		for (let t = 0; t <= i; t += 1) {
			if (n.length > 0 && t === 0) continue;
			let a = e.length * t / i;
			n.push({
				pathDistance: r + a,
				sample: b(e, a)
			});
		}
		r += e.length;
	}), n;
}
function y(e, t, n, r) {
	let i = n - r.midline;
	e.push(t.sample.x + t.sample.nx * i, t.sample.y + t.sample.ny * i, t.pathDistance, n / r.cssHeight);
}
function b(e, t) {
	if (e.kind === "line") return {
		nx: e.nx,
		ny: e.ny,
		tx: e.tx,
		ty: e.ty,
		x: e.x1 + e.tx * t,
		y: e.y1 + e.ty * t
	};
	let n = e.startAngle + e.direction * (t / e.radius), r = -Math.sin(n) * e.direction, i = Math.cos(n) * e.direction;
	return {
		curveRadius: e.radius,
		nx: -i,
		ny: r,
		tx: r,
		ty: i,
		x: e.centerX + Math.cos(n) * e.radius,
		y: e.centerY + Math.sin(n) * e.radius
	};
}
function x(e, t) {
	let n = Math.hypot(e, t);
	return {
		x: e / n,
		y: t / n
	};
}
//#endregion
//#region src/textStrip.ts
function S(e, t) {
	let n = Math.min(t, 2), r = o(document.createElement("canvas")), i = e.runs.map((t) => w(r, t, e)), a = Math.ceil(i.reduce((e, t) => e + t, 0) + e.stripPaddingX * 2), s = Math.ceil(e.font.lineHeight + e.stripPaddingY * 2), c = document.createElement("canvas"), l = o(c);
	c.width = Math.ceil(a * n), c.height = Math.ceil(s * n), l.scale(n, n), l.textBaseline = "alphabetic", l.imageSmoothingEnabled = !0, l.imageSmoothingQuality = "high", r.font = T(e.font);
	let u = r.measureText("Hg"), d = u.actualBoundingBoxAscent || e.font.size * .78, f = u.actualBoundingBoxDescent || e.font.size * .22, p = e.stripPaddingY + (e.font.lineHeight - d - f) / 2 + d, m = e.stripPaddingX;
	e.runs.forEach((t, n) => {
		let r = i[n] ?? 0;
		t.background && (k(l, m - e.backgroundPaddingX, e.stripPaddingY - 6, r + e.backgroundPaddingX * 2, e.font.lineHeight + 12, e.backgroundRadius), l.fillStyle = t.background, l.fill()), l.font = T(e.font, t), l.fillStyle = t.fill || "#111111", l.globalCompositeOperation = t.punchOut ? "destination-out" : "source-over", O(l, t.text, m, p, t.tracking ?? e.letterSpacing), t.underline && (l.strokeStyle = t.fill || "#111111", l.lineWidth = Math.max(2, e.font.size * .07), l.beginPath(), l.moveTo(m, p + e.font.size * .14), l.lineTo(m + r, p + e.font.size * .14), l.stroke()), l.globalCompositeOperation = "source-over", m += r;
	});
	let h = C(c, n);
	return {
		canvas: c,
		cssHeight: s,
		cssWidth: a,
		midline: s / 2,
		scale: n,
		visibleEnd: h.end,
		visibleStart: h.start
	};
}
function C(e, t) {
	let { data: n, height: r, width: i } = o(e).getImageData(0, 0, e.width, e.height), a = i, s = -1;
	for (let e = 0; e < r; e += 1) for (let t = 0; t < i; t += 1) n[(e * i + t) * 4 + 3] > 0 && (a = Math.min(a, t), s = Math.max(s, t));
	return s < a ? {
		end: e.width / t,
		start: 0
	} : {
		end: (s + 1) / t,
		start: a / t
	};
}
function w(e, t, n) {
	return e.font = T(n.font, t), D(e, t.text, t.tracking ?? n.letterSpacing);
}
function T(e, t) {
	return `${t?.fontStyle ?? e.style} ${t?.fontWeight ?? e.weight} ${e.size}px ${E(e.family)}, ${e.fallback}`;
}
function E(e) {
	return e.includes(" ") ? `"${e}"` : e;
}
function D(e, t, n) {
	let r = Array.from(t);
	return r.reduce((t, i, a) => {
		let o = a < r.length - 1 ? n : 0;
		return t + e.measureText(i).width + o;
	}, 0);
}
function O(e, t, n, r, i) {
	let a = n;
	Array.from(t).forEach((t, n, o) => {
		e.fillText(t, a, r), a += e.measureText(t).width, n < o.length - 1 && (a += i);
	});
}
function k(e, t, n, r, i, a) {
	let o = Math.min(a, r / 2, i / 2);
	e.beginPath(), e.moveTo(t + o, n), e.lineTo(t + r - o, n), e.quadraticCurveTo(t + r, n, t + r, n + o), e.lineTo(t + r, n + i - o), e.quadraticCurveTo(t + r, n + i, t + r - o, n + i), e.lineTo(t + o, n + i), e.quadraticCurveTo(t, n + i, t, n + i - o), e.lineTo(t, n + o), e.quadraticCurveTo(t, n, t + o, n), e.closePath();
}
async function A(e) {
	if (e.url) {
		let t = new FontFace(e.family, `url(${e.url})`, {
			style: e.style,
			weight: String(e.weight)
		});
		await t.load(), document.fonts.add(t);
	}
	await document.fonts.ready;
}
//#endregion
//#region src/distortion.ts
async function j(e) {
	if (!e.textureUrl) return;
	let t = new Image();
	return t.crossOrigin = "anonymous", t.decoding = "async", t.src = e.textureUrl, await t.decode(), t;
}
//#endregion
//#region src/shaders/edge-ticker.frag.glsl
var M = "#version 300 es\nprecision highp float;\n\nin vec2 vDistortionUv;\nin vec2 vUv;\nin float vWindowX;\n\nuniform float uDistortionEnabled;\nuniform float uRepeatTexture;\nuniform float uWindowLength;\nuniform sampler2D uDistortionTexture;\nuniform vec2 uDistortionStrength;\nuniform sampler2D uTexture;\n\nout vec4 outColor;\n\nvoid main() {\n  if (vWindowX < 0.0 || vWindowX > uWindowLength) {\n    discard;\n  }\n\n  vec2 uv = vUv;\n\n  if (uDistortionEnabled > 0.5) {\n    vec2 offset = texture(uDistortionTexture, vDistortionUv).rg * 2.0 - 1.0;\n    uv += offset * uDistortionStrength;\n  }\n\n  if (uRepeatTexture < 0.5 && (uv.x < 0.0 || uv.x > 1.0)) {\n    discard;\n  }\n\n  if (uv.y < 0.0 || uv.y > 1.0) {\n    discard;\n  }\n\n  outColor = texture(uTexture, uv);\n}", N = "#version 300 es\nprecision highp float;\n\nin vec2 aPosition;\nin float aPathDistance;\nin float aTexY;\n\nuniform vec2 uResolution;\nuniform vec2 uDistortionRepeat;\nuniform float uDistortionScrollMode;\nuniform float uPathLength;\nuniform float uSourceBias;\nuniform float uStripWidth;\nuniform float uTravel;\nuniform float uTravelFactor;\n\nout vec2 vDistortionUv;\nout vec2 vUv;\nout float vWindowX;\n\nvoid main() {\n  vec2 zeroToOne = aPosition / uResolution;\n  vec2 clip = zeroToOne * 2.0 - 1.0;\n  float windowX = aPathDistance + uTravelFactor * uTravel + uSourceBias;\n  float pathUvX = aPathDistance / uPathLength;\n  float textUvX = windowX / uStripWidth;\n\n  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\n  vUv = vec2(textUvX, aTexY);\n  vWindowX = windowX;\n  vDistortionUv = vec2(\n    mix(pathUvX, textUvX, uDistortionScrollMode) * uDistortionRepeat.x,\n    aTexY * uDistortionRepeat.y\n  );\n}";
//#endregion
//#region src/glRenderer.ts
function P(e) {
	let t = l(e, c(e, e.VERTEX_SHADER, N), c(e, e.FRAGMENT_SHADER, M)), n = f(e.createBuffer(), "buffer"), r = f(e.createTexture(), "texture"), i = f(e.createTexture(), "distortion texture");
	return e.useProgram(t), e.enable(e.BLEND), e.disable(e.DEPTH_TEST), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA), e.bindTexture(e.TEXTURE_2D, r), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), {
		attributes: {
			pathDistance: d(e, t, "aPathDistance"),
			position: d(e, t, "aPosition"),
			texY: d(e, t, "aTexY")
		},
		buffer: n,
		distortionTexture: i,
		gl: e,
		pathLength: 0,
		program: t,
		stripWidth: 1,
		texture: r,
		uniforms: {
			distortionEnabled: u(e, t, "uDistortionEnabled"),
			distortionRepeat: u(e, t, "uDistortionRepeat"),
			distortionSampler: u(e, t, "uDistortionTexture"),
			distortionScrollMode: u(e, t, "uDistortionScrollMode"),
			distortionStrength: u(e, t, "uDistortionStrength"),
			pathLength: u(e, t, "uPathLength"),
			repeatTexture: u(e, t, "uRepeatTexture"),
			resolution: u(e, t, "uResolution"),
			sourceBias: u(e, t, "uSourceBias"),
			stripWidth: u(e, t, "uStripWidth"),
			texture: u(e, t, "uTexture"),
			travel: u(e, t, "uTravel"),
			travelFactor: u(e, t, "uTravelFactor"),
			windowLength: u(e, t, "uWindowLength")
		},
		vertexCount: 0,
		windowLength: 1
	};
}
function F(e, t, n, r, i, a, o, s, c, l) {
	let { gl: u } = e, d = c.enabled && !!l;
	e.pathLength = r, e.stripWidth = t.cssWidth, e.vertexCount = n.length / 4, e.windowLength = s, u.viewport(0, 0, Math.ceil(i * o), Math.ceil(a * o)), u.useProgram(e.program), u.uniform2f(e.uniforms.resolution, i, a), u.uniform1f(e.uniforms.pathLength, r), u.uniform1f(e.uniforms.stripWidth, t.cssWidth), u.uniform1f(e.uniforms.windowLength, s), u.uniform1i(e.uniforms.texture, 0), u.uniform1i(e.uniforms.distortionSampler, 1), u.uniform1f(e.uniforms.distortionEnabled, +!!d), u.uniform2f(e.uniforms.distortionRepeat, Math.max(.001, c.repeatX), Math.max(.001, c.repeatY)), u.uniform1f(e.uniforms.distortionScrollMode, +!!c.scrollWithText), u.uniform2f(e.uniforms.distortionStrength, c.strengthAlong / t.cssWidth, c.strengthAcross / t.cssHeight), u.bindBuffer(u.ARRAY_BUFFER, e.buffer), u.bufferData(u.ARRAY_BUFFER, n, u.STATIC_DRAW), L(e), u.activeTexture(u.TEXTURE0), u.bindTexture(u.TEXTURE_2D, e.texture), u.pixelStorei(u.UNPACK_FLIP_Y_WEBGL, !1), u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, u.RGBA, u.UNSIGNED_BYTE, t.canvas), u.activeTexture(u.TEXTURE1), u.bindTexture(u.TEXTURE_2D, e.distortionTexture), l ? u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, u.RGBA, u.UNSIGNED_BYTE, l) : u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, 1, 1, 0, u.RGBA, u.UNSIGNED_BYTE, new Uint8Array([
		128,
		128,
		128,
		255
	]));
}
function I(e, t, n, r) {
	let { gl: i } = e, a = n === "reverse";
	i.clearColor(0, 0, 0, 0), i.clear(i.COLOR_BUFFER_BIT), i.useProgram(e.program), i.uniform1f(e.uniforms.travel, t), i.uniform1f(e.uniforms.travelFactor, a ? 1 : -1), i.uniform1f(e.uniforms.repeatTexture, +!!r), i.uniform1f(e.uniforms.sourceBias, a ? -e.pathLength : e.windowLength), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, e.texture), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, e.distortionTexture), i.bindBuffer(i.ARRAY_BUFFER, e.buffer), L(e), i.drawArrays(i.TRIANGLES, 0, e.vertexCount);
}
function L(e) {
	let { gl: t } = e, n = 4 * Float32Array.BYTES_PER_ELEMENT;
	t.enableVertexAttribArray(e.attributes.position), t.vertexAttribPointer(e.attributes.position, 2, t.FLOAT, !1, n, 0), t.enableVertexAttribArray(e.attributes.pathDistance), t.vertexAttribPointer(e.attributes.pathDistance, 1, t.FLOAT, !1, n, 2 * Float32Array.BYTES_PER_ELEMENT), t.enableVertexAttribArray(e.attributes.texY), t.vertexAttribPointer(e.attributes.texY, 1, t.FLOAT, !1, n, 3 * Float32Array.BYTES_PER_ELEMENT);
}
//#endregion
//#region src/EdgeTicker.ts
var R = class {
	canvas;
	gl;
	renderer;
	options;
	layoutState;
	distortionTextureSource;
	frameRequested = !1;
	destroyed = !1;
	onResize = () => this.rebuildLayout();
	onScroll = () => this.requestDraw();
	constructor(n, r = {}) {
		this.canvas = a(n), this.gl = s(this.canvas), this.renderer = P(this.gl), this.options = t(e, r), this.start();
	}
	getOptions() {
		return this.options;
	}
	update(e) {
		this.destroyed || (this.options = t(this.options, e), this.reload());
	}
	refresh() {
		this.rebuildLayout();
	}
	destroy() {
		this.destroyed || (this.destroyed = !0, window.removeEventListener("resize", this.onResize), window.removeEventListener("scroll", this.onScroll));
	}
	async start() {
		await A(this.options.font), this.distortionTextureSource = await j(this.options.distortion), !this.destroyed && (this.rebuildLayout(), window.addEventListener("resize", this.onResize), window.addEventListener("scroll", this.onScroll, { passive: !0 }), this.requestDraw());
	}
	async reload() {
		await A(this.options.font), this.distortionTextureSource = await j(this.options.distortion), !this.destroyed && this.rebuildLayout();
	}
	rebuildLayout() {
		if (this.destroyed) return;
		let e = this.options, t = window.innerWidth, n = window.innerHeight, r = Math.min(window.devicePixelRatio || 1, 2), i = S(e, r), a = this.resolveOverscan(e, i), o = p(t, n, e, a.path), s = e.repeatTexture ? i.cssWidth * Math.max(.01, e.repeatWindowCopies) : i.cssWidth, c = _(o, i, e), l = this.getWindowVisibleBounds(s, i), u = e.direction === "reverse" ? l.start + a.inside.start : s - l.end + a.inside.start, d = e.direction === "reverse" ? o.length + l.end - a.inside.end : o.length + s - l.start - a.inside.end, f = Math.max(1, d - u), m = Math.max(0, e.scrollLaps), h = this.resolveScrollPadding(e, f), g = Math.max(1, f + h.start + h.end);
		this.canvas.width = Math.ceil(t * r), this.canvas.height = Math.ceil(n * r), this.canvas.style.width = `${t}px`, this.canvas.style.height = `${n}px`, F(this.renderer, i, c, o.length, t, n, r, s, e.distortion, this.distortionTextureSource), this.layoutState = {
			activeTravelDistance: f,
			direction: e.direction,
			lapCount: m,
			repeatTexture: e.repeatTexture,
			scrollPaddingStart: h.start,
			travelOffset: u,
			travelDistance: g
		}, this.requestDraw();
	}
	resolveOverscan(e, t) {
		let n = e.exitOverscan.end * t.cssWidth, r = e.exitOverscan.start * t.cssWidth, i = {
			end: Math.max(0, n),
			start: Math.max(0, r)
		};
		return {
			inside: {
				end: Math.max(0, -n),
				start: Math.max(0, -r)
			},
			path: this.mapLogicalRangeToPath(e.direction, i)
		};
	}
	mapLogicalRangeToPath(e, t) {
		return e === "reverse" ? {
			end: t.start,
			start: t.end
		} : t;
	}
	resolveScrollPadding(e, t) {
		return {
			end: e.scrollPadding.end * t,
			start: e.scrollPadding.start * t
		};
	}
	requestDraw() {
		this.frameRequested || this.destroyed || (this.frameRequested = !0, requestAnimationFrame(() => {
			this.frameRequested = !1, this.drawTicker();
		}));
	}
	drawTicker() {
		if (!this.layoutState || this.destroyed) return;
		let { activeTravelDistance: e, direction: t, lapCount: n, repeatTexture: r, scrollPaddingStart: a, travelDistance: o, travelOffset: s } = this.layoutState, c = Math.max(1, this.getMaxScrollDistance()), l = i((i(window.scrollY / c, 0, 1) * o - a) / e, 0, 1) * e * n, u = this.getLoopedTravel(l, e);
		I(this.renderer, u + s, t, r);
	}
	getLoopedTravel(e, t) {
		if (e <= 0) return 0;
		let n = e % t;
		return n < 1e-4 ? t : n;
	}
	getWindowVisibleBounds(e, t) {
		let n = Math.min(t.visibleStart, e), r = n;
		for (let n = 0; n < e; n += t.cssWidth) {
			let i = n + t.visibleStart, a = Math.min(n + t.visibleEnd, e);
			i <= e && a > i && (r = Math.max(r, a));
		}
		return {
			end: r,
			start: n
		};
	}
	getMaxScrollDistance() {
		return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
	}
};
function z(e, t = {}) {
	return new R(e, t);
}
//#endregion
export { R as EdgeTicker, z as createEdgeTicker, e as defaultOptions, t as resolveOptions };
