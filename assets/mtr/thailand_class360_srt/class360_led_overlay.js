// v16.1: Packed integer Color values avoid Rhino choosing the float RGB overload.
// ANTE supplies print(), not a browser console. Logging must never
// throw inside an error handler and prevent the LED fallback from rendering.
function class360Log(message) {
    try {
        if (typeof print === 'function') print(String(message));
    } catch (ignoredLog) { }
}

// Class 360 MTR3 / NTE LED v9: v7.1 stable LED + native Minecraft 1.20.1 glyphs.
// v9: MC bitmap/Unicode glyphs + emissive LED materials; optional displays. Body, doors, BVE sounds and pantographs
// continue using the UNCHANGED v3/v5 MTR3 legacy OBJ renderer.
importPackage(java.awt);

var class360LedBase = {};
try {
    var class360LedRaw = ModelManager.loadPartedRawModel(
        Resources.manager(), Resources.idr('class360_led_overlay.obj'), null);
    var class360LedNames = ['front_pidsdest', 'front_sideled_dest', 'front_sideled_dest1'];
    for (var class360I = 0; class360I < class360LedNames.length; class360I++) {
        var class360Name = class360LedNames[class360I];
        var class360Part = class360LedRaw.get(class360Name);
        if (class360Part != null) {
            class360Part.applyUVMirror(false, true);
            class360LedBase[class360Name] = ModelManager.uploadVertArrays(class360Part);
        }
    }
} catch (e) {
    class360Log('[Class360 LED v6] Panel mesh loading failed; base vehicle unaffected: ' + e);
}

var class360Fonts = [];
var class360FontNames = ['Noto Sans CJK SC', 'Noto Sans Mono CJK SC', 'Noto Sans', 'Microsoft YaHei', 'SimHei', 'Dialog', 'SansSerif'];
for (var class360F = 0; class360F < class360FontNames.length; class360F++) {
    try {
        var class360Font = Resources.getSystemFont(class360FontNames[class360F]);
        if (class360Font != null) class360Fonts.push(class360Font);
    } catch (ignoredFont) { }
}
if (class360Fonts.length === 0) class360Fonts.push(new Font('Dialog', Font.PLAIN, 24));

// A compact 5x7 pixel font for ASCII, used to imitate Minecraft's blocky LED text.
// Chinese and other non-ASCII characters still use a CJK fallback font, but with
// anti-aliasing disabled so the overall appearance remains closer to pixel art.
var class360PixelGlyphs = {
' ': ['00000','00000','00000','00000','00000','00000','00000'],
'!': ['00100','00100','00100','00100','00100','00000','00100'],
'&': ['01100','10010','10100','01000','10101','10010','01101'],
'(': ['00010','00100','01000','01000','01000','00100','00010'],
')': ['01000','00100','00010','00010','00010','00100','01000'],
'-': ['00000','00000','00000','11111','00000','00000','00000'],
'.': ['00000','00000','00000','00000','00000','01100','01100'],
'/': ['00001','00010','00100','01000','10000','00000','00000'],
':': ['00000','01100','01100','00000','01100','01100','00000'],
'_': ['00000','00000','00000','00000','00000','00000','11111'],
"'": ['00100','00100','00000','00000','00000','00000','00000'],
',': ['00000','00000','00000','00000','01100','01100','00100'],
'0': ['01110','10001','10011','10101','11001','10001','01110'],
'1': ['00100','01100','00100','00100','00100','00100','01110'],
'2': ['01110','10001','00001','00010','00100','01000','11111'],
'3': ['11110','00001','00001','01110','00001','00001','11110'],
'4': ['00010','00110','01010','10010','11111','00010','00010'],
'5': ['11111','10000','10000','11110','00001','00001','11110'],
'6': ['01110','10000','10000','11110','10001','10001','01110'],
'7': ['11111','00001','00010','00100','01000','01000','01000'],
'8': ['01110','10001','10001','01110','10001','10001','01110'],
'9': ['01110','10001','10001','01111','00001','00001','01110'],
'A': ['01110','10001','10001','11111','10001','10001','10001'],
'B': ['11110','10001','10001','11110','10001','10001','11110'],
'C': ['01110','10001','10000','10000','10000','10001','01110'],
'D': ['11110','10001','10001','10001','10001','10001','11110'],
'E': ['11111','10000','10000','11110','10000','10000','11111'],
'F': ['11111','10000','10000','11110','10000','10000','10000'],
'G': ['01110','10001','10000','10111','10001','10001','01110'],
'H': ['10001','10001','10001','11111','10001','10001','10001'],
'I': ['01110','00100','00100','00100','00100','00100','01110'],
'J': ['00001','00001','00001','00001','10001','10001','01110'],
'K': ['10001','10010','10100','11000','10100','10010','10001'],
'L': ['10000','10000','10000','10000','10000','10000','11111'],
'M': ['10001','11011','10101','10101','10001','10001','10001'],
'N': ['10001','10001','11001','10101','10011','10001','10001'],
'O': ['01110','10001','10001','10001','10001','10001','01110'],
'P': ['11110','10001','10001','11110','10000','10000','10000'],
'Q': ['01110','10001','10001','10001','10101','10010','01101'],
'R': ['11110','10001','10001','11110','10100','10010','10001'],
'S': ['01111','10000','10000','01110','00001','00001','11110'],
'T': ['11111','00100','00100','00100','00100','00100','00100'],
'U': ['10001','10001','10001','10001','10001','10001','01110'],
'V': ['10001','10001','10001','10001','10001','01010','00100'],
'W': ['10001','10001','10001','10101','10101','10101','01010'],
'X': ['10001','10001','01010','00100','01010','10001','10001'],
'Y': ['10001','10001','01010','00100','00100','00100','00100'],
'Z': ['11111','00001','00010','00100','01000','10000','11111'],
'?': ['01110','10001','00001','00010','00100','00000','00100']
};
for (var class360Code = 97; class360Code <= 122; class360Code++) {
    var class360Lower = String.fromCharCode(class360Code);
    class360PixelGlyphs[class360Lower] = class360PixelGlyphs[class360Lower.toUpperCase()];
}

function class360BestFont(value) {
    for (var f = 0; f < class360Fonts.length; f++) {
        try { if (class360Fonts[f].canDisplayUpTo(value) < 0) return class360Fonts[f]; }
        catch (ignored) { }
    }
    return class360Fonts[0];
}

function class360IsAsciiPixelText(value) {
    return /^[\x20-\x7E]+$/.test(value);
}

function class360MeasurePixelText(value, scale, gap) {
    var width = 0;
    for (var i = 0; i < value.length; i++) {
        var ch = value.charAt(i);
        var glyph = class360PixelGlyphs[ch];
        if (glyph == null) glyph = class360PixelGlyphs['?'];
        var gw = glyph[0].length;
        width += gw * scale;
        if (i < value.length - 1) width += gap;
    }
    return width;
}

function class360DrawPixelText(g, value, areaW, areaH) {
    var scale = 14;
    var gap = 4;
    var rows = 7;
    while (scale > 4) {
        var width = class360MeasurePixelText(value, scale, gap);
        var height = rows * scale;
        if (width <= areaW - 16 && height <= areaH - 12) break;
        scale -= 1;
        if (gap > 1 && scale % 2 === 0) gap -= 1;
    }
    var widthFinal = class360MeasurePixelText(value, scale, gap);
    var x = Math.max(6, Math.floor((areaW - widthFinal) / 2));
    var y = Math.max(4, Math.floor((areaH - rows * scale) / 2));
    for (var i = 0; i < value.length; i++) {
        var ch = value.charAt(i);
        var glyph = class360PixelGlyphs[ch];
        if (glyph == null) glyph = class360PixelGlyphs['?'];
        for (var r = 0; r < glyph.length; r++) {
            var row = glyph[r];
            for (var c = 0; c < row.length; c++) {
                if (row.charAt(c) === '1') g.fillRect(x + c * scale, y + r * scale, scale, scale);
            }
        }
        x += glyph[0].length * scale + gap;
    }
}

function class360ExteriorCreate(ctx, state, train) {
    state.class360LedOK = false;
    state.class360LedModels = {};
    state.class360LedLastText = null;
    state.class360LedRenderError = false;
    try {
        if (!class360LedBase['front_pidsdest'] ||
            !class360LedBase['front_sideled_dest'] ||
            !class360LedBase['front_sideled_dest1']) return;
        state.class360LedTex = new GraphicsTexture(1024, 128);
        for (var i = 0; i < class360LedNames.length; i++) {
            var name = class360LedNames[i];
            var part = class360LedBase[name].copyForMaterialChanges();
            part.replaceAllTexture(state.class360LedTex.identifier);
            state.class360LedModels[name] = part;
        }
        state.class360LedOK = true;
    } catch (e) {
        class360Log('[Class360 LED v6] Display init failed; base vehicle unaffected: ' + e);
    }
}

function class360Trim(s) {
    return String(s == null ? '' : s).replace(/^\s+|\s+$/g, '');
}
function class360LanguageParts(value) {
    var raw = class360Trim(value);
    if (!raw) return [];
    var chunks = raw.split('|');
    var out = [];
    for (var j = 0; j < chunks.length; j++) {
        var name = class360Trim(chunks[j]);
        // MTR's '||EXTRA' notation denotes non-station metadata. Do not render it.
        if (!name) break;
        if (out.indexOf(name) < 0) out.push(name);
    }
    return out;
}

function class360DestinationNames(train) {
    try {
        if (!train.isOnRoute()) return ['NOT IN SERVICE'];
        var platforms = train.getThisRoutePlatforms();
        if (platforms == null || platforms.size() === 0) return ['NOT IN SERVICE'];
        var n = train.getThisRoutePlatformsNextIndex();
        // Use the route terminus belonging to the next/current platform.
        if (n < 0) n = 0;
        if (n >= platforms.size()) n = platforms.size() - 1;
        var p = platforms.get(n);
        var custom = class360Trim(p.destinationName);
        var station = '';
        if (p.destinationStation != null) station = class360Trim(p.destinationStation.name);
        var namesCustom = class360LanguageParts(custom);
        var namesStation = class360LanguageParts(station);
        // A single-language 'destinationName' may be a redundant copy of just the
        // English or Chinese portion of the full bilingual station name. Prefer
        // the original bilingual names in that case, not just the English copy.
        if (namesCustom.length > 1) return namesCustom;
        if (namesStation.length > 1 &&
            (namesCustom.length === 0 ||
             namesStation.join('|').toLowerCase().indexOf(namesCustom[0].toLowerCase()) >= 0)) {
            return namesStation;
        }
        if (namesCustom.length > 0) return namesCustom;
        if (namesStation.length > 0) return namesStation;
        return ['AIRPORT RAIL LINK'];
    } catch (e) {
        return ['AIRPORT RAIL LINK'];
    }
}

// v9: Minecraft 1.20.1 font providers. The original font uses bitmap
// atlases for western languages and UNIHEX (Unifont) for CJK/Unicode.
// Do not require ASCII to load successfully before accessing Unifont:
// older v8 did that and silently rendered an entire Chinese sign with AWT.
// Font data is accessed from the running Minecraft client; no font is shipped.
var class360McFontLoaded = false;
var class360McBitmapAvailable = false;
var class360McProviders = {};
var class360McGlyphs = {};
var class360McUnihexTried = {};
var class360McUnihexGlyphs = {};
var class360McFallbackGlyphs = {};
var class360McUnifontAsset = 'minecraft:font/unifont.zip';
var class360McSizeOverrides = [];
var class360McUnifontErrorLogged = false;
var class360McBitmapErrorLogged = false;
var class360McAnyVanillaGlyph = false;

function class360McWarnBitmap(msg) {
    if (class360McBitmapErrorLogged) return;
    class360McBitmapErrorLogged = true;
    class360Log('[Class360 LED v9] Vanilla bitmap font unavailable: ' + msg);
}
function class360McWarnUnifont(msg) {
    if (class360McUnifontErrorLogged) return;
    class360McUnifontErrorLogged = true;
    class360Log('[Class360 LED v9] Vanilla Unicode Unifont unavailable: ' + msg);
}

function class360McCodepoints(value) {
    var out = [];
    for (var i = 0; i < value.length; i++) {
        var cp = value.charCodeAt(i);
        if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < value.length) {
            var low = value.charCodeAt(i + 1);
            if (low >= 0xdc00 && low <= 0xdfff) {
                cp = 0x10000 + (cp - 0xd800) * 1024 + low - 0xdc00;
                i++;
            }
        }
        out.push(cp);
    }
    return out;
}

function class360McLoadProviders() {
    if (class360McFontLoaded) return class360McBitmapAvailable;
    class360McFontLoaded = true;
    try {
        // Resolve the same default bitmap providers used in MC 1.20.1.
        var txt = Resources.readString(Resources.id('minecraft:font/include/default.json'));
        if (txt != null) {
            var providers = JSON.parse(String(txt)).providers;
            if (providers != null) {
                for (var i = 0; i < providers.length; i++) {
                    var p = providers[i];
                    if (p.type !== 'bitmap' || !p.file || !p.chars || !p.chars.length) continue;
                    var rawFile = String(p.file);
                    var colon = rawFile.indexOf(':');
                    var fileLoc = colon >= 0 ? rawFile.substring(0,colon) + ':textures/' + rawFile.substring(colon+1)
                                            : 'minecraft:textures/' + rawFile;
                    var img;
                    try { img = Resources.readBufferedImage(Resources.id(fileLoc)); }
                    catch (unavailable) { continue; }
                    if (img == null) continue;
                    var rows = p.chars.length;
                    var cols = class360McCodepoints(String(p.chars[0])).length;
                    if (cols < 1 || rows < 1) continue;
                    var cw = Math.floor(img.getWidth()/cols), ch = Math.floor(img.getHeight()/rows);
                    if (cw < 1 || ch < 1) continue;
                    for (var y = 0; y < rows; y++) {
                        var chars = class360McCodepoints(String(p.chars[y]));
                        for (var x = 0; x < chars.length; x++) {
                            var cp = chars[x];
                            if (cp !== 0 && !Object.prototype.hasOwnProperty.call(class360McProviders,cp)) {
                                class360McProviders[cp] = {image:img, x:x*cw, y:y*ch, w:cw, h:ch};
                                class360McBitmapAvailable = true;
                            }
                        }
                    }
                }
            }
        }
    } catch (e) { class360McWarnBitmap(String(e)); }
    // These settings are defined by Minecraft itself; obtain the actual
    // Unihex ZIP ID and left/right CJK size overrides from the default font.
    try {
        var desc = Resources.readString(Resources.id('minecraft:font/include/unifont.json'));
        if (desc != null) {
            var cfg = JSON.parse(String(desc));
            if (cfg.providers != null) {
                for (var i=0; i<cfg.providers.length; i++) {
                    var p=cfg.providers[i];
                    if (p.type !== 'unihex') continue;
                    if (p.hex_file) class360McUnifontAsset=String(p.hex_file);
                    if (p.size_overrides) {
                        for (var j=0; j<p.size_overrides.length; j++) {
                            var o=p.size_overrides[j];
                            if (!o.from || !o.to) continue;
                            var a=class360McCodepoints(String(o.from));
                            var b=class360McCodepoints(String(o.to));
                            if (a.length && b.length) class360McSizeOverrides.push({a:a[0],b:b[0],left:o.left,right:o.right});
                        }
                    }
                }
            }
        }
    } catch (ignored) { }
    return class360McBitmapAvailable;
}

function class360McGlyphFromBitmap(cp) {
    var p=class360McProviders[cp];
    if (p == null) return null;
    var pts=[], last=-1;
    for (var y=0; y<p.h; y++) for (var x=0; x<p.w; x++) {
        var argb=p.image.getRGB(p.x+x,p.y+y);
        if (((argb >>> 24) & 255) > 48) { pts.push([x,y]); if(x>last) last=x; }
    }
    if (last<0) return null;
    return {pixels:pts, pixH:p.h, width:last+1, advance:(last+2)*8/p.h};
}

function class360McDecodeUnihex(cp,hex) {
    if (!/^[0-9a-fA-F]+$/.test(hex) || (hex.length !== 32 && hex.length !== 64 && hex.length !== 96 && hex.length !== 128)) return null;
    var width=hex.length/4;
    var digits=width/4;
    var pts=[], left=width, right=-1;
    for (var y=0; y<16; y++) {
        var offset=y*digits;
        for (var n=0; n<digits; n++) {
            var bits=parseInt(hex.charAt(offset+n),16);
            for (var bit=0; bit<4; bit++) if ((bits & (8>>bit))!==0) {
                var x=n*4+bit; pts.push([x,y]);
                if (x<left) left=x;
                if (x>right) right=x;
            }
        }
    }
    if (right<left) return null;
    // Use vanilla's size overrides verbatim, including full-width CJK and Hangul.
    for (var z=0; z<class360McSizeOverrides.length; z++) {
        var o=class360McSizeOverrides[z];
        if (cp>=o.a && cp<=o.b) {left=o.left;right=o.right;break;}
    }
    // Same fallback ranges as vanilla 1.20.1 for missing resource metadata.
    if (class360McSizeOverrides.length===0 &&
        ((cp>=0x3001 && cp<=0x30ff) || (cp>=0x3200 && cp<=0x9fff) ||
         (cp>=0xf900 && cp<=0xfaff) || (cp>=0xff01 && cp<=0xff5e))) {
        left=0;right=15;
    } else if (class360McSizeOverrides.length===0 && cp>=0xac00 && cp<=0xd7af) {
        left=0;right=14;
    }
    var clipped=[];
    for (var k=0;k<pts.length;k++) if (pts[k][0]>=left && pts[k][0]<=right) {
        clipped.push([pts[k][0]-left,pts[k][1]]);
    }
    return {pixels:clipped,pixH:16,width:right-left+1,advance:(right-left+2)*0.5};
}

// Search selected glyphs rather than decompressing the entire Unicode font
// into each train instance. The global cache is shared across trains of type.
function class360McLoadUnihexFor(cps) {
    class360McLoadProviders();
    var needed={}, remaining=0;
    for (var i=0; i<cps.length; i++) {
        var cp=cps[i];
        if (cp===32 || cp===0xa0 || class360McProviders[cp] || class360McUnihexTried[cp]) continue;
        if (!Object.prototype.hasOwnProperty.call(needed,cp)) {needed[cp]=true;remaining++;}
    }
    if (!remaining) return;
    for (var k in needed) if (Object.prototype.hasOwnProperty.call(needed,k)) class360McUnihexTried[k]=true;
    var stream=null, zip=null;
    try {
        stream=Resources.readStream(Resources.id(class360McUnifontAsset));
        zip=new java.util.zip.ZipInputStream(stream);
        var entry;
        while (remaining>0 && (entry=zip.getNextEntry())!=null) {
            if (String(entry.getName()).toLowerCase().slice(-4)!=='.hex') {zip.closeEntry();continue;}
            var buf=new java.io.ByteArrayOutputStream();
            var bytes=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,8192);
            var len;
            while ((len=zip.read(bytes,0,bytes.length))!==-1) {
                if (len>0) buf.write(bytes,0,len);
            }
            var lines=String(new java.lang.String(buf.toByteArray(),'UTF-8')).split(/\r?\n/);
            for (var r=0; r<lines.length && remaining>0; r++) {
                var line=lines[r], sep=line.indexOf(':');
                if (sep<4 || sep>6) continue;
                var code=line.substring(0,sep);
                if (!/^[0-9a-fA-F]+$/.test(code)) continue;
                var cp=parseInt(code,16);
                if (!Object.prototype.hasOwnProperty.call(needed,cp)) continue;
                var glyph=class360McDecodeUnihex(cp,line.substring(sep+1).replace(/\s+$/g,''));
                if (glyph!=null) {class360McUnihexGlyphs[cp]=glyph;class360McAnyVanillaGlyph=true;}
                delete needed[cp];remaining--;
            }
            zip.closeEntry();
        }
    } catch (e) {class360McWarnUnifont(String(e));}
    finally {
        try {if(zip!=null) zip.close(); else if(stream!=null) stream.close();}catch(ignoredClose){}
    }
}

// If vanilla lacks a particular Unicode glyph, rasterize just that character
// as an 8/16px pixel bitmap. Never downgrade a complete Chinese/English line
// to system-font rendering because of one unsupported symbol.
function class360McMissingGlyph(cp) {
    if (Object.prototype.hasOwnProperty.call(class360McFallbackGlyphs,cp)) return class360McFallbackGlyphs[cp];
    var result=null;
    try {
        var ch=cp<=65535?String.fromCharCode(cp):String.fromCharCode(0xd800+((cp-65536)>>10),0xdc00+((cp-65536)&1023));
        var font=class360BestFont(ch).deriveFont(Font.PLAIN,16);
        var img=new java.awt.image.BufferedImage(40,20,java.awt.image.BufferedImage.TYPE_INT_ARGB);
        var g=img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);
        g.setFont(font);g.setColor(Color.WHITE);g.drawString(ch,0,15);
        var m=g.getFontMetrics(font);var measured=Math.max(1,Math.min(35,m.stringWidth(ch)));
        g.dispose();
        var pts=[];
        for(var y=0;y<16;y++) for(var x=0;x<measured;x++) if(((img.getRGB(x,y)>>>24)&255)>80) pts.push([x,y]);
        if(pts.length) result={pixels:pts,pixH:16,width:measured,advance:(measured+1)*0.5};
    } catch(ignored) {}
    class360McFallbackGlyphs[cp]=result;
    return result;
}

function class360McGetGlyph(cp) {
    if (cp===32 || cp===0xa0) return {pixels:[],pixH:8,width:3,advance:4};
    if (Object.prototype.hasOwnProperty.call(class360McGlyphs,cp)) return class360McGlyphs[cp];
    var glyph=class360McGlyphFromBitmap(cp);
    if (glyph==null) glyph=class360McUnihexGlyphs[cp];
    if (glyph!=null) class360McAnyVanillaGlyph=true;
    class360McGlyphs[cp]=glyph;
    return glyph;
}

// NTE LED baseline adjustment: Minecraft's 16-pixel Unihex CJK glyphs have
// a lower visual center than the 8-pixel Latin glyphs after half-scaling.
// Raise only CJK glyphs by ONE 8-pixel-font unit; do not move the LED plane,
// the background, or any Latin/digit glyph.  Works with bilingual strings.
function class360McIsCjkCodepoint(cp) {
    return (cp >= 0x1100 && cp <= 0x11ff) ||
           (cp >= 0x2e80 && cp <= 0xa4cf) ||
           (cp >= 0xac00 && cp <= 0xd7af) ||
           (cp >= 0xf900 && cp <= 0xfaff) ||
           (cp >= 0xfe30 && cp <= 0xfe4f) ||
           (cp >= 0xff01 && cp <= 0xff60) ||
           (cp >= 0x20000 && cp <= 0x3134f);
}

function class360McDrawVanillaText(g,value) {
    class360McLoadProviders();
    var cps=class360McCodepoints(String(value));
    // Unicode is no longer gated by the success of the ASCII provider.
    class360McLoadUnihexFor(cps);
    var glyphs=[], units=0;
    for(var i=0;i<cps.length;i++) {
        var glyph=class360McGetGlyph(cps[i]);
        if(glyph==null) glyph=class360McMissingGlyph(cps[i]);
        if(glyph==null) return false; // last-resort v7.1 fallback
        glyphs.push(glyph);units+=glyph.advance;
    }
    if(!glyphs.length || !class360McAnyVanillaGlyph) return false;
    // 8px vanilla lettering; Unifont is natively 16px and uses half-scale.
    var scale=14;
    while(scale>2 && (units*scale>990 || 8*scale>112))scale-=2;
    if(units*scale>1004) scale=Math.max(1,1004/units);
    var xx=Math.floor((1024-units*scale)/2), yy=Math.floor((128-8*scale)/2);
    g.setColor(new Color(0xFF9900));
    for(var n=0;n<glyphs.length;n++) {
        var cell=glyphs[n], step=scale*8/cell.pixH;
        // Unihex CJK shares this text box with Latin but sits visually lower.
        // One source-font pixel up = scale texture pixels; English unaffected.
        var glyphY=yy+(class360McIsCjkCodepoint(cps[n]) ? -scale : 0);
        for(var d=0;d<cell.pixels.length;d++) {
            var dot=cell.pixels[d];
            var x0=Math.round(xx+dot[0]*step),y0=Math.round(glyphY+dot[1]*step);
            var x1=Math.round(xx+(dot[0]+1)*step),y1=Math.round(glyphY+(dot[1]+1)*step);
            g.fillRect(x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0));
        }
        xx+=cell.advance*scale;
    }
    return true;
}

function class360DrawText(state, value) {
    var g = state.class360LedTex.graphics;
    g.setColor(new Color(0x060709));
    g.fillRect(0, 0, 1024, 128);
    try {
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_NEAREST_NEIGHBOR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
    } catch (ignoredHint) { }
    g.setColor(new Color(0xFF9900)); // MTR4 original FF9900

    // Always keep the previously working v7.1 path as the fallback.
    var vanillaOK=false;
    try { vanillaOK=class360McDrawVanillaText(g,value); }
    catch (e) { class360McWarnUnifont('Glyph rendering error, fallback enabled: '+e); }
    if (vanillaOK) {
        state.class360LedTex.upload();
        return;
    }
    g.setColor(new Color(0x060709));
    g.fillRect(0, 0, 1024, 128);
    g.setColor(new Color(0xFF9900));
    if (class360IsAsciiPixelText(value)) {
        class360DrawPixelText(g, value, 1024, 128);
    } else {
        var fontBase = class360BestFont(value);
        var size = 76;
        var font = fontBase.deriveFont(Font.BOLD, size);
        g.setFont(font);
        var fm = g.getFontMetrics(font);
        while (size > 20 && (fm.stringWidth(value) > 980 || fm.getHeight() > 118)) {
            size -= 2;
            font = fontBase.deriveFont(Font.BOLD, size);
            g.setFont(font);
            fm = g.getFontMetrics(font);
        }
        var x = Math.max(6, Math.floor((1024 - fm.stringWidth(value)) / 2));
        var y = Math.floor((128 - fm.getHeight()) / 2) + fm.getAscent();
        g.drawString(value, x, y);
    }
    state.class360LedTex.upload();
}

function class360DrawCab(ctx, state, car, pose) {
    ctx.drawCarModel(state.class360LedModels['front_pidsdest'], car, pose);
    ctx.drawCarModel(state.class360LedModels['front_sideled_dest'], car, pose);
    ctx.drawCarModel(state.class360LedModels['front_sideled_dest1'], car, pose);
}

function class360ExteriorRender(ctx, state, train) {
    if (!state.class360LedOK) return;
    try {
        if (!train.shouldRenderDetail() || train.trainCars() < 1) return;
        var names = class360DestinationNames(train);
        // Cycle all MTR languages, like source MTR4's CYCLE_LANGUAGES option.
        // Language changes even while staying at the same station.
        var selected = names[Math.floor(Date.now() / 3600) % names.length];
        if (selected !== state.class360LedLastText) {
            class360DrawText(state, selected);
            state.class360LedLastText = selected;
        }
        // Our v6 OBJ has the front cab in +Z. The rear cab is the same geometry
        // rotated 180 degrees, putting its nose in -Z. Never affect base cars.
        class360DrawCab(ctx, state, 0, null);
        if (train.trainCars() > 1) {
            var back = new Matrices();
            back.rotateY(Math.PI);
            class360DrawCab(ctx, state, train.trainCars() - 1, back);
        }
    } catch (e) {
        if (!state.class360LedRenderError) {
            class360Log('[Class360 LED v6] LED-only render problem: ' + e);
            state.class360LedRenderError = true;
        }
    }
}

function class360ExteriorDispose(ctx, state, train) {
    try { if (state.class360LedTex != null) state.class360LedTex.close(); }
    catch (ignored) { }
    state.class360LedTex = null;
    state.class360LedModels = {};
    state.class360LedOK = false;
}

// Class 360 v18: MTR3/ANTE equivalents of the original MTR4 interior DISPLAY parts.
// Two green scrolling signs and four TVs per carriage, using the original screen artwork.
var class360InsideBase = {}, class360TvBackground = null;
var class360InsideNames = ['inside_next', 'inside_destination', 'inside_tv'];
try {
    var insideRaw = ModelManager.loadPartedRawModel(Resources.manager(), Resources.idr('class360_interior_overlay.obj'), null);
    for (var ii=0; ii<class360InsideNames.length; ii++) {
        var iname=class360InsideNames[ii], ipart=insideRaw.get(iname);
        if (ipart==null) throw new Error('Missing interior panel '+iname);
        ipart.applyUVMirror(false,true);
        class360InsideBase[iname]=ModelManager.uploadVertArrays(ipart);
    }
    class360TvBackground=Resources.readBufferedImage(Resources.idr('screen.png'));
} catch(e) { class360Log('[Class360 v18] Interior resources: '+e); }

function class360InteriorCreate(state) {
    state.class360Inside={models:{},textures:{},last:{},error:false};
    try {
        for(var i=0;i<class360InsideNames.length;i++) {
            var name=class360InsideNames[i];
            if(!class360InsideBase[name])throw new Error('Interior model unavailable');
            var tex=name==='inside_tv'?new GraphicsTexture(900,507):new GraphicsTexture(1024,128);
            state.class360Inside.textures[name]=tex;
            var model=class360InsideBase[name].copyForMaterialChanges();
            model.replaceAllTexture(tex.identifier);
            state.class360Inside.models[name]=model;
        }
        state.class360Inside.ready=true;
    } catch(e) {class360Log('[Class360 v18] Interior create: '+e);}
}

function class360InsideLanguage(names,tick) {
    return names && names.length ? names[tick%names.length] : '';
}
function class360InsideCjk(s) {return /[\u2e80-\u9fff\uac00-\ud7af]/.test(String(s));}
function class360InsideRoute(train,now) {
    var phase=Math.floor(now/3600), result={onRoute:false,next:'NOT IN SERVICE',destination:'NOT IN SERVICE',stopped:false};
    try {
        if(!train.isOnRoute())return result;
        result.onRoute=true;
        result.destination=class360InsideLanguage(class360DestinationNames(train),phase)||'AIRPORT RAIL LINK';
        var platforms=train.getThisRoutePlatforms();
        var n=train.getThisRoutePlatformsNextIndex();
        if(platforms!=null && n>=0 && n<platforms.size()) {
            var p=platforms.get(n);
            if(p.station!=null)result.next=class360InsideLanguage(class360LanguageParts(p.station.name),phase)||'—';
            else result.next='—';
        } else result.next='—';
        try {result.stopped=train.doorValue()>0.01;}catch(ignoredDoor){}
    }catch(e){class360Log('[Class360 v18] Route lookup: '+e);}
    return result;
}

// Pixel glyphs share the already verified vanilla font cache with the external LED.
function class360InsideRun(text) {
    class360McLoadProviders();
    var cps=class360McCodepoints(String(text));class360McLoadUnihexFor(cps);
    var cells=[],units=0;
    for(var i=0;i<cps.length;i++) {
        var cell=class360McGetGlyph(cps[i]);
        if(cell==null)cell=class360McMissingGlyph(cps[i]);
        if(cell==null)return null;
        cells.push(cell);units+=cell.advance;
    }
    return {cells:cells,units:units,codepoints:cps};
}
function class360InsidePaintRun(g,run,x,y,scale,alignCjk) {
    for(var i=0;i<run.cells.length;i++) {
        var cell=run.cells[i], step=scale*8/cell.pixH;
        // Match the external LED baseline; keep TV and Latin glyph positions unchanged.
        var glyphY=y+(alignCjk && class360McIsCjkCodepoint(run.codepoints[i]) ? -scale : 0);
        for(var j=0;j<cell.pixels.length;j++) {
            var dot=cell.pixels[j];
            var x0=Math.round(x+dot[0]*step),y0=Math.round(glyphY+dot[1]*step);
            var x1=Math.round(x+(dot[0]+1)*step),y1=Math.round(glyphY+(dot[1]+1)*step);
            g.fillRect(x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0));
        }
        x+=cell.advance*scale;
    }
}
function class360InsideFont(g,text,size,maxWidth) {
    var base=class360BestFont(text),font=base.deriveFont(Font.PLAIN,size);
    g.setFont(font);
    while(size>8 && g.getFontMetrics().stringWidth(text)>maxWidth){size-=1;font=base.deriveFont(Font.PLAIN,size);g.setFont(font);}
    return g.getFontMetrics();
}
function class360InsideMarquee(tex,text,now) {
    var g=tex.graphics;g.setColor(new Color(0x060709));g.fillRect(0,0,1024,128);
    g.setColor(new Color(0x50C800));
    var run=class360InsideRun(text),scale=12,width;
    if(run) {
        width=run.units*scale;
        var x=width>1000 ? 16-((now*0.09)%(width+160)) : Math.floor((1024-width)/2);
        class360InsidePaintRun(g,run,x,16,scale,true);
        if(width>1000)class360InsidePaintRun(g,run,x+width+160,16,scale,true);
    } else {
        var font=class360BestFont(text).deriveFont(Font.PLAIN,76);g.setFont(font);
        var metrics=g.getFontMetrics();width=metrics.stringWidth(text);
        var x=width>1000?16-((now*0.09)%(width+160)):Math.floor((1024-width)/2);
        g.drawString(text,Math.floor(x),92);
        if(width>1000)g.drawString(text,Math.floor(x+width+160),92);
    }
    tex.upload();
}
function class360InsideTvText(g,text,x,y,width,size,color) {
    text=String(text);g.setColor(new Color(color));
    var run=class360InsideRun(text);
    if(run && run.units>0) {
        var scale=Math.min(size/8,width/run.units);
        class360InsidePaintRun(g,run,x,y,scale);
    } else {
        var metrics=class360InsideFont(g,text,size,width);g.drawString(text,x,y+metrics.getAscent());
    }
}
function class360InsideTv(tex,route) {
    var g=tex.graphics;
    if(class360TvBackground!=null)g.drawImage(class360TvBackground,0,0,900,507,null);
    else {g.setColor(new Color(0xE7E7E7));g.fillRect(0,0,900,507);}
    var chinese=class360InsideCjk(route.next)||class360InsideCjk(route.destination);
    var heading=route.onRoute?(route.stopped?(chinese?'本站':'This station'):(chinese?'下一站':'Next station')):'NOT IN SERVICE';
    class360InsideTvText(g,heading,55,7,800,40,0xFFFFFF);
    class360InsideTvText(g,route.next,370,145,390,48,0x111111);
    class360InsideTvText(g,chinese?'终点站':'Destination',370,260,480,30,0x333333);
    class360InsideTvText(g,route.destination,370,315,490,45,0x111111);
    tex.upload();
}
function class360InteriorRender(ctx,state,train) {
    var inside=state.class360Inside;
    if(!inside || !inside.ready || !train.shouldRenderDetail())return;
    try {
        var now=Date.now(),route=class360InsideRoute(train,now),isCjk=class360InsideCjk(route.next);
        var next=route.onRoute?(route.stopped?(isCjk?'本站：':'This is '):(isCjk?'下一站：':'Next station: '))+route.next:'NOT IN SERVICE';
        var dest=route.onRoute?(class360InsideCjk(route.destination)?'终点站：':'Destination: ')+route.destination:'NOT IN SERVICE';
        // Limit scrolling texture work to 10 Hz; television redraws only on data/language changes.
        var frame=Math.floor(now/100),tvkey=JSON.stringify(route);
        if(inside.last.frame!==frame || inside.last.next!==next || inside.last.dest!==dest) {
            class360InsideMarquee(inside.textures.inside_next,next,now);
            class360InsideMarquee(inside.textures.inside_destination,dest,now);
            inside.last.frame=frame;inside.last.next=next;inside.last.dest=dest;
        }
        if(inside.last.tv!==tvkey) {class360InsideTv(inside.textures.inside_tv,route);inside.last.tv=tvkey;}
        for(var car=0;car<train.trainCars();car++) {
            var pose=null;
            if(car===train.trainCars()-1 && car>0){pose=new Matrices();pose.rotateY(Math.PI);}
            for(var i=0;i<class360InsideNames.length;i++)ctx.drawCarModel(inside.models[class360InsideNames[i]],car,pose);
        }
    }catch(e){if(!inside.error){inside.error=true;class360Log('[Class360 v18] Interior render: '+e);}}
}
function class360InteriorDispose(state) {
    if(!state.class360Inside)return;
    for(var name in state.class360Inside.textures)try{state.class360Inside.textures[name].close();}catch(ignored){}
    state.class360Inside=null;
}
function create(ctx,state,train){class360ExteriorCreate(ctx,state,train);class360InteriorCreate(state);}
function render(ctx,state,train){class360ExteriorRender(ctx,state,train);class360InteriorRender(ctx,state,train);}
function dispose(ctx,state,train){class360InteriorDispose(state);class360ExteriorDispose(ctx,state,train);}
