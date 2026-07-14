//#region src/defaults.ts
var e = {
	backgroundPaddingX: 12,
	backgroundPaddingY: 6,
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
function S(e, t, n = 8192) {
	let r = Math.min(t, 2), i = o(document.createElement("canvas")), a = Math.ceil(C(i, e)), s = Math.max(1, Math.floor(n / r)), c = w(i, e, Math.min(a, s)), l = E(i, e.font, e), u = Math.ceil(c.cssWidth), d = Math.ceil(e.font.lineHeight + e.stripPaddingY * 2), f = Math.min(e.stripPaddingX, u), p = Math.max(1, u - f - e.stripPaddingX), m = Math.ceil(c.rowWidth), h = c.rowCount, g = document.createElement("canvas"), _ = o(g);
	return g.width = Math.ceil(m * r), g.height = Math.ceil(d * h * r), _.scale(r, r), _.textBaseline = "alphabetic", _.imageSmoothingEnabled = !0, _.imageSmoothingQuality = "high", e.runs.forEach((t) => {
		let n = c.glyphs.filter((e) => e.run === t), r = M(n.map((e) => ({
			end: e.localX + e.advance,
			row: e.row,
			run: t,
			start: e.localX
		})));
		if (t.background) {
			let n = M(c.backgroundSegments.filter((e) => e.run === t)), r = D(i, e.font, t);
			n.forEach((n) => {
				I(_, n, l.baseline, r, d, e, t.background);
			});
		}
		_.font = k(e.font, t), _.fillStyle = t.fill || "#111111", _.globalCompositeOperation = t.punchOut ? "destination-out" : "source-over", n.forEach((t) => {
			N(_, t, r, l, d, e);
		}), t.underline && L(_, M(c.underlineSegments.filter((e) => e.run === t)), l, d, e, t.fill || "#111111", t), _.globalCompositeOperation = "source-over";
	}), {
		canvas: g,
		cssHeight: d,
		cssWidth: u,
		midline: d / 2,
		repeatSourceStart: f,
		repeatSourceWidth: p,
		scale: r,
		textureRows: h,
		textureRowWidth: m,
		visibleEnd: c.visibleEnd,
		visibleStart: c.visibleStart
	};
}
function C(e, t) {
	return t.stripPaddingX * 2 + t.runs.reduce((n, r) => n + T(e, r, t), 0);
}
function w(e, t, n) {
	let r = [], i = [], a = [], o = t.stripPaddingX, s = Infinity, c = -Infinity;
	function l(e, t) {
		s = Math.min(s, e), c = Math.max(c, t);
	}
	t.runs.forEach((s) => {
		let c = s.tracking ?? t.letterSpacing, u = Array.from(s.text);
		e.font = k(t.font, s), u.forEach((t, d) => {
			let f = e.measureText(t).width, p = f + (d < u.length - 1 ? c : 0), m = Math.floor(o / n) * n, h = o - m;
			h > 0 && h + Math.max(f, p) > n && (o = m + n);
			let g = Math.floor(o / n), _ = o, v = o - g * n, y = o + p, b = t.trim().length > 0, x = {
				advance: p,
				glyph: t,
				localX: v,
				logicalEnd: y,
				logicalStart: _,
				row: g,
				run: s,
				visible: b,
				width: f
			};
			r.push(x), s.background && p > 0 ? (i.push({
				end: v + p,
				row: g,
				run: s,
				start: v
			}), l(_, y)) : b && f > 0 && l(_, _ + f), s.underline && p > 0 && (a.push({
				end: v + p,
				row: g,
				run: s,
				start: v
			}), l(_, y)), o += p;
		});
	}), o += t.stripPaddingX;
	let u = Math.max(1, o), d = Math.max(1, Math.ceil(u / n));
	return (!Number.isFinite(s) || !Number.isFinite(c)) && (s = 0, c = u), {
		backgroundSegments: i,
		cssWidth: u,
		glyphs: r,
		rowCount: d,
		rowWidth: n,
		underlineSegments: a,
		visibleEnd: c,
		visibleStart: s
	};
}
function T(e, t, n) {
	return e.font = k(n.font, t), j(e, t.text, t.tracking ?? n.letterSpacing);
}
function E(e, t, n) {
	let r = O(e, t);
	return {
		ascent: r.ascent,
		baseline: n.stripPaddingY + (t.lineHeight - r.ascent - r.descent) / 2 + r.ascent,
		descent: r.descent
	};
}
function D(e, t, n) {
	return O(e, t, n);
}
function O(e, t, n) {
	e.font = k(t, n);
	let r = e.measureText("Hg");
	return {
		ascent: r.fontBoundingBoxAscent || r.actualBoundingBoxAscent || t.size * .78,
		descent: r.fontBoundingBoxDescent || r.actualBoundingBoxDescent || t.size * .22
	};
}
function k(e, t) {
	return `${t?.fontStyle ?? e.style} ${t?.fontWeight ?? e.weight} ${e.size}px ${A(e.family)}, ${e.fallback}`;
}
function A(e) {
	return e.includes(" ") ? `"${e}"` : e;
}
function j(e, t, n) {
	let r = Array.from(t);
	return r.reduce((t, i, a) => {
		let o = a < r.length - 1 ? n : 0;
		return t + e.measureText(i).width + o;
	}, 0);
}
function M(e) {
	let t = [...e].sort((e, t) => e.row === t.row ? e.start - t.start : e.row - t.row), n = [];
	return t.forEach((e) => {
		let t = n.at(-1);
		if (t && t.run === e.run && t.row === e.row && e.start <= t.end + .1) {
			t.end = Math.max(t.end, e.end);
			return;
		}
		n.push({ ...e });
	}), n;
}
function N(e, t, n, r, i, a) {
	let o = P(t, n);
	F(e, t.run, o, i, a, () => {
		e.fillText(t.glyph, t.localX, t.row * i + r.baseline);
	});
}
function P(e, t) {
	return t.find((t) => t.row === e.row && e.localX >= t.start - .1 && e.localX <= t.end + .1) ?? {
		end: e.localX + e.advance,
		row: e.row,
		run: e.run,
		start: e.localX
	};
}
function F(e, t, n, r, i, a) {
	if (!t.mirrorX && !t.mirrorY) {
		a();
		return;
	}
	let o = n.row * r + i.stripPaddingY + i.font.lineHeight / 2 + (t.mirrorY ? (t.mirrorOffsetY ?? 0) / 2 : 0);
	e.save(), e.translate(t.mirrorX ? n.start + n.end : 0, t.mirrorY ? o * 2 : 0), e.scale(t.mirrorX ? -1 : 1, t.mirrorY ? -1 : 1), a(), e.restore();
}
function I(e, t, n, r, i, a, o) {
	let s = t.row * i + n - r.ascent - a.backgroundPaddingY;
	R(e, t.start - a.backgroundPaddingX, s, t.end - t.start + a.backgroundPaddingX * 2, r.ascent + r.descent + a.backgroundPaddingY * 2, a.backgroundRadius), e.fillStyle = o, e.fill();
}
function L(e, t, n, r, i, a, o) {
	e.strokeStyle = a, e.lineWidth = Math.max(2, i.font.size * .07), t.forEach((t) => {
		F(e, o, t, r, i, () => {
			let a = t.row * r + n.baseline + i.font.size * .14;
			e.beginPath(), e.moveTo(t.start, a), e.lineTo(t.end, a), e.stroke();
		});
	});
}
function R(e, t, n, r, i, a) {
	let o = Math.min(a, r / 2, i / 2);
	e.beginPath(), e.moveTo(t + o, n), e.lineTo(t + r - o, n), e.quadraticCurveTo(t + r, n, t + r, n + o), e.lineTo(t + r, n + i - o), e.quadraticCurveTo(t + r, n + i, t + r - o, n + i), e.lineTo(t + o, n + i), e.quadraticCurveTo(t, n + i, t, n + i - o), e.lineTo(t, n + o), e.quadraticCurveTo(t, n, t + o, n), e.closePath();
}
async function z(e) {
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
async function B(e) {
	if (!e.textureUrl) return;
	let t = new Image();
	return t.crossOrigin = "anonymous", t.decoding = "async", t.src = e.textureUrl, await t.decode(), t;
}
//#endregion
//#region src/shaders/edge-ticker.frag.glsl
var V = "#version 300 es\nprecision highp float;\n\nin vec2 vDistortionUv;\nin vec2 vUv;\nin float vWindowX;\n\nuniform float uDistortionEnabled;\nuniform float uRepeatSourceStart;\nuniform float uRepeatSourceWidth;\nuniform float uRepeatTexture;\nuniform float uTextureRows;\nuniform float uTextureRowWidth;\nuniform float uWindowLength;\nuniform sampler2D uDistortionTexture;\nuniform vec2 uDistortionStrength;\nuniform float uStripWidth;\nuniform sampler2D uTexture;\n\nout vec4 outColor;\n\nvoid main() {\n  if (vWindowX < 0.0 || vWindowX > uWindowLength) {\n    discard;\n  }\n\n  vec2 uv = vUv;\n\n  if (uDistortionEnabled > 0.5) {\n    vec2 offset = texture(uDistortionTexture, vDistortionUv).rg * 2.0 - 1.0;\n    uv += offset * uDistortionStrength;\n  }\n\n  float sourceX = uv.x * uStripWidth;\n\n  if (uRepeatTexture > 0.5) {\n    sourceX = uRepeatSourceStart + mod(\n      mod(sourceX, uRepeatSourceWidth) + uRepeatSourceWidth,\n      uRepeatSourceWidth\n    );\n  } else if (sourceX < 0.0 || sourceX > uStripWidth) {\n    discard;\n  }\n\n  if (uv.y < 0.0 || uv.y > 1.0) {\n    discard;\n  }\n\n  float row = floor(sourceX / uTextureRowWidth);\n\n  if (row < 0.0 || row >= uTextureRows) {\n    discard;\n  }\n\n  float localX = sourceX - row * uTextureRowWidth;\n  vec2 atlasUv = vec2(\n    localX / uTextureRowWidth,\n    (row + uv.y) / uTextureRows\n  );\n\n  outColor = texture(uTexture, atlasUv);\n}", H = "#version 300 es\nprecision highp float;\n\nin vec2 aPosition;\nin float aPathDistance;\nin float aTexY;\n\nuniform vec2 uResolution;\nuniform vec2 uDistortionRepeat;\nuniform float uDistortionScrollMode;\nuniform float uPathLength;\nuniform float uSourceBias;\nuniform float uStripWidth;\nuniform float uTravel;\nuniform float uTravelFactor;\n\nout vec2 vDistortionUv;\nout vec2 vUv;\nout float vWindowX;\n\nvoid main() {\n  vec2 zeroToOne = aPosition / uResolution;\n  vec2 clip = zeroToOne * 2.0 - 1.0;\n  float windowX = aPathDistance + uTravelFactor * uTravel + uSourceBias;\n  float pathUvX = aPathDistance / uPathLength;\n  float textUvX = windowX / uStripWidth;\n\n  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);\n  vUv = vec2(textUvX, aTexY);\n  vWindowX = windowX;\n  vDistortionUv = vec2(\n    mix(pathUvX, textUvX, uDistortionScrollMode) * uDistortionRepeat.x,\n    aTexY * uDistortionRepeat.y\n  );\n}";
//#endregion
//#region src/glRenderer.ts
function U(e) {
	let t = l(e, c(e, e.VERTEX_SHADER, H), c(e, e.FRAGMENT_SHADER, V)), n = f(e.createBuffer(), "buffer"), r = f(e.createTexture(), "texture"), i = f(e.createTexture(), "distortion texture");
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
			repeatSourceStart: u(e, t, "uRepeatSourceStart"),
			repeatSourceWidth: u(e, t, "uRepeatSourceWidth"),
			repeatTexture: u(e, t, "uRepeatTexture"),
			resolution: u(e, t, "uResolution"),
			sourceBias: u(e, t, "uSourceBias"),
			stripWidth: u(e, t, "uStripWidth"),
			textureRows: u(e, t, "uTextureRows"),
			textureRowWidth: u(e, t, "uTextureRowWidth"),
			texture: u(e, t, "uTexture"),
			travel: u(e, t, "uTravel"),
			travelFactor: u(e, t, "uTravelFactor"),
			windowLength: u(e, t, "uWindowLength")
		},
		vertexCount: 0,
		windowLength: 1
	};
}
function W(e, t, n, r, i, a, o, s, c, l) {
	let { gl: u } = e, d = c.enabled && !!l;
	e.pathLength = r, e.stripWidth = t.cssWidth, e.vertexCount = n.length / 4, e.windowLength = s, u.viewport(0, 0, Math.ceil(i * o), Math.ceil(a * o)), u.useProgram(e.program), u.uniform2f(e.uniforms.resolution, i, a), u.uniform1f(e.uniforms.pathLength, r), u.uniform1f(e.uniforms.repeatSourceStart, t.repeatSourceStart), u.uniform1f(e.uniforms.repeatSourceWidth, t.repeatSourceWidth), u.uniform1f(e.uniforms.stripWidth, t.cssWidth), u.uniform1f(e.uniforms.textureRows, t.textureRows), u.uniform1f(e.uniforms.textureRowWidth, t.textureRowWidth), u.uniform1f(e.uniforms.windowLength, s), u.uniform1i(e.uniforms.texture, 0), u.uniform1i(e.uniforms.distortionSampler, 1), u.uniform1f(e.uniforms.distortionEnabled, +!!d), u.uniform2f(e.uniforms.distortionRepeat, Math.max(.001, c.repeatX), Math.max(.001, c.repeatY)), u.uniform1f(e.uniforms.distortionScrollMode, +!!c.scrollWithText), u.uniform2f(e.uniforms.distortionStrength, c.strengthAlong / t.cssWidth, c.strengthAcross / t.cssHeight), u.bindBuffer(u.ARRAY_BUFFER, e.buffer), u.bufferData(u.ARRAY_BUFFER, n, u.STATIC_DRAW), K(e), u.activeTexture(u.TEXTURE0), u.bindTexture(u.TEXTURE_2D, e.texture), u.pixelStorei(u.UNPACK_FLIP_Y_WEBGL, !1), u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, u.RGBA, u.UNSIGNED_BYTE, t.canvas), u.activeTexture(u.TEXTURE1), u.bindTexture(u.TEXTURE_2D, e.distortionTexture), l ? u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, u.RGBA, u.UNSIGNED_BYTE, l) : u.texImage2D(u.TEXTURE_2D, 0, u.RGBA, 1, 1, 0, u.RGBA, u.UNSIGNED_BYTE, new Uint8Array([
		128,
		128,
		128,
		255
	]));
}
function G(e, t, n, r) {
	let { gl: i } = e, a = n === "reverse";
	i.clearColor(0, 0, 0, 0), i.clear(i.COLOR_BUFFER_BIT), i.useProgram(e.program), i.uniform1f(e.uniforms.travel, t), i.uniform1f(e.uniforms.travelFactor, a ? 1 : -1), i.uniform1f(e.uniforms.repeatTexture, +!!r), i.uniform1f(e.uniforms.sourceBias, a ? -e.pathLength : e.windowLength), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, e.texture), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, e.distortionTexture), i.bindBuffer(i.ARRAY_BUFFER, e.buffer), K(e), i.drawArrays(i.TRIANGLES, 0, e.vertexCount);
}
function K(e) {
	let { gl: t } = e, n = 4 * Float32Array.BYTES_PER_ELEMENT;
	t.enableVertexAttribArray(e.attributes.position), t.vertexAttribPointer(e.attributes.position, 2, t.FLOAT, !1, n, 0), t.enableVertexAttribArray(e.attributes.pathDistance), t.vertexAttribPointer(e.attributes.pathDistance, 1, t.FLOAT, !1, n, 2 * Float32Array.BYTES_PER_ELEMENT), t.enableVertexAttribArray(e.attributes.texY), t.vertexAttribPointer(e.attributes.texY, 1, t.FLOAT, !1, n, 3 * Float32Array.BYTES_PER_ELEMENT);
}
//#endregion
//#region src/EdgeTicker.ts
var q = class {
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
		this.canvas = a(n), this.gl = s(this.canvas), this.renderer = U(this.gl), this.options = t(e, r), this.start();
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
		await z(this.options.font), this.distortionTextureSource = await B(this.options.distortion), !this.destroyed && (this.rebuildLayout(), window.addEventListener("resize", this.onResize), window.addEventListener("scroll", this.onScroll, { passive: !0 }), this.requestDraw());
	}
	async reload() {
		await z(this.options.font), this.distortionTextureSource = await B(this.options.distortion), !this.destroyed && this.rebuildLayout();
	}
	rebuildLayout() {
		if (this.destroyed) return;
		let e = this.options, t = window.innerWidth, n = window.innerHeight, r = Math.min(window.devicePixelRatio || 1, 2), i = S(e, r, this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE)), a = this.resolveOverscan(e, i), o = p(t, n, e, a.path), s = e.repeatTexture ? i.repeatSourceWidth * Math.max(.01, e.repeatWindowCopies) : i.cssWidth, c = _(o, i, e), l = this.getWindowVisibleBounds(s, i, e.repeatTexture), u = e.direction === "reverse" ? l.start + a.inside.start : s - l.end + a.inside.start, d = e.direction === "reverse" ? o.length + l.end - a.inside.end : o.length + s - l.start - a.inside.end, f = Math.max(1, d - u), m = Math.max(0, e.scrollLaps), h = this.resolveScrollPadding(e, f), g = Math.max(1, f + h.start + h.end);
		this.canvas.width = Math.ceil(t * r), this.canvas.height = Math.ceil(n * r), this.canvas.style.width = `${t}px`, this.canvas.style.height = `${n}px`, W(this.renderer, i, c, o.length, t, n, r, s, e.distortion, this.distortionTextureSource), this.layoutState = {
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
		G(this.renderer, u + s, t, r);
	}
	getLoopedTravel(e, t) {
		if (e <= 0) return 0;
		let n = e % t;
		return n < 1e-4 ? t : n;
	}
	getWindowVisibleBounds(e, t, n) {
		let r = n ? t.repeatSourceStart : 0, a = n ? t.repeatSourceWidth : t.cssWidth, o = i(t.visibleStart - r, 0, a), s = i(t.visibleEnd - r, 0, a), c = Math.min(o, e), l = c;
		for (let t = 0; t < e; t += a) {
			let n = t + o, r = Math.min(t + s, e);
			n <= e && r > n && (l = Math.max(l, r));
		}
		return {
			end: l,
			start: c
		};
	}
	getMaxScrollDistance() {
		return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
	}
};
function J(e, t = {}) {
	return new q(e, t);
}
//#endregion
export { q as EdgeTicker, J as createEdgeTicker, e as defaultOptions, t as resolveOptions };
