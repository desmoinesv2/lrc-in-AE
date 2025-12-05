
import { ScriptConfig } from '../types';

/**
 * Generates the .jsx script content for After Effects.
 * Uses strict Match Names (ADBE...) for universal compatibility across languages.
 */
export const generateAeScript = (config: ScriptConfig): string => {
  
  return `
/**
 * LyricalAE - 歌词生成脚本 (多语言兼容版)
 * 
 * 使用说明:
 * 1. 菜单 文件 (File) > 脚本 (Scripts) > 运行脚本文件 (Run Script File...)
 * 2. 选择本 .jsx 文件
 * 3. 导入 LRC 并点击“生成歌词序列”
 */

{
    function LyricalAEScript(thisObj) {
        var scriptName = "LyricalAE 歌词助手";
        
        // --- CONFIGURATION ---
        var cfg = {
            compName: "${config.compName}",
            width: ${config.compWidth},
            height: ${config.compHeight},
            fps: ${config.fps},
            duration: ${config.duration},
            fontSize: ${config.fontSize},
            font: "${config.fontFamily}",
            textColor: [${hexToRgb(config.textColor)}], // Active (White)
            inactiveColor: [${hexToRgb(config.inactiveTextColor)}], // Inactive (Gray)
            spacing: ${config.spacing},
            blurMax: ${config.blurAmount},
            activeScale: ${config.activeScale},
            damping: ${config.motionDamping},
            alignment: "${config.alignment || 'left'}",
            textLift: ${config.textLift}
        };

        // --- UI BUILDER ---
        function buildUI(thisObj) {
            var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable: true});
            win.orientation = "column";
            win.alignChildren = ["fill", "top"];
            win.spacing = 10;
            win.margins = 16;

            var grpInfo = win.add("group");
            grpInfo.orientation = "column";
            grpInfo.alignChildren = ["left", "center"];
            grpInfo.add("statictext", undefined, "1. 选择 .lrc 歌词文件");
            grpInfo.add("statictext", undefined, "2. 点击 '生成歌词序列'");
            
            var btnGroup = win.add("group");
            btnGroup.orientation = "row";
            var btnImport = btnGroup.add("button", undefined, "选择 LRC...");
            var stPath = win.add("statictext", undefined, "未选择文件", {truncate: "middle"});
            stPath.preferredSize.width = 200;

            var btnBuild = win.add("button", undefined, "生成歌词序列");
            btnBuild.enabled = false;
            
            var progressBar = win.add("progressbar", undefined, 0, 100);
            progressBar.preferredSize.width = 250;
            progressBar.visible = false;

            var lrcFile = null;

            btnImport.onClick = function() {
                var f = File.openDialog("请选择 LRC 文件", "*.lrc;*.txt");
                if (f) {
                    lrcFile = f;
                    stPath.text = f.name;
                    btnBuild.enabled = true;
                }
            };

            btnBuild.onClick = function() {
                if (!lrcFile || !lrcFile.exists) {
                    alert("请选择有效的 LRC 文件。");
                    return;
                }
                
                app.beginUndoGroup("LyricalAE 生成");
                try {
                    progressBar.visible = true;
                    progressBar.value = 0;
                    
                    lrcFile.open("r");
                    lrcFile.encoding = "UTF-8";
                    var content = lrcFile.read();
                    lrcFile.close();
                    
                    var lines = parseLrc(content);
                    if (lines.length === 0) {
                        alert("未找到有效的歌词行。请检查文件格式。");
                        return;
                    }
                    
                    var comp = app.project.items.addComp(cfg.compName, cfg.width, cfg.height, 1, cfg.duration, cfg.fps);
                    comp.openInViewer();
                    
                    var ctrl = comp.layers.addNull();
                    ctrl.name = "Controller (控制层)";
                    // ADBE Slider Control = Slider Control
                    var slider = ctrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
                    slider.name = "Scroll Y";
                    
                    createLyricLayers(comp, lines, ctrl, progressBar);
                    
                    progressBar.value = 100;
                    alert("成功！已生成 " + lines.length + " 行歌词。");
                } catch(e) {
                    alert("发生错误: " + e.toString() + "\\n行号: " + e.line);
                } finally {
                    app.endUndoGroup();
                    progressBar.visible = false;
                }
            };

            win.layout.layout(true);
            return win;
        }

        function parseLrc(text) {
            // Fix: Double escape regex backslashes for the generated string
            var lines = text.split(/(\\r\\n|\\r|\\n)/);
            var result = [];
            // Fix: Double escape \\d, \\., \\[ for the generated string
            var regex = /\\[(\\d{2}):(\\d{2})\\.(\\d{2,3})\\](.*)/;
            
            for (var i = 0; i < lines.length; i++) {
                var match = lines[i].match(regex);
                if (match) {
                    var mins = parseInt(match[1], 10);
                    var secs = parseInt(match[2], 10);
                    var ms = parseInt(match[3], 10);
                    if (match[3].length === 2) ms *= 10;
                    
                    var time = mins * 60 + secs + (ms / 1000);
                    // Fix: Double escape \\s
                    var txt = match[4].replace(/^\\s+|\\s+$/g, '');
                    
                    if (txt.length > 0) {
                        result.push({time: time, text: txt});
                    }
                }
            }
            return result;
        }

        function createLyricLayers(comp, lines, ctrl, pb) {
            // Access Slider using property index to be safe, or match name
            // ADBE Effect Parade -> 1 (Slider Control) -> ADBE Slider Control-0001 (Slider)
            // Using the user-set name "Scroll Y" to retrieve the property.
            var activeIndexProp = ctrl.property("ADBE Effect Parade").property("Scroll Y").property("ADBE Slider Control-0001");

            // Setup Keys for Active Index
            for (var i = 0; i < lines.length; i++) {
                var t = lines[i].time;
                var keyIndex = activeIndexProp.addKey(t);
                activeIndexProp.setValueAtKey(keyIndex, i);
                activeIndexProp.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
            }

            // Create Smooth Index
            var smoothEffect = ctrl.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
            smoothEffect.name = "Smooth Index";
            var smoothSliderProp = smoothEffect.property("ADBE Slider Control-0001");
            
            // Updated Bounce Expression for "Viscous/Sticky" feel
            var bounceExpr = 
                "var amp = " + (0.5 * cfg.damping) + ";\\n" +
                "var freq = 1.2;\\n" +
                "var decay = 5.0;\\n" +
                "var n = 0;\\n" +
                "var t = 0;\\n" +
                "// Use match names in expression for safety\\n" +
                "var activeVal = thisComp.layer('" + ctrl.name + "').effect('Scroll Y')('ADBE Slider Control-0001');\\n" +
                "if (activeVal.numKeys > 0) {\\n" +
                "  n = activeVal.nearestKey(time).index;\\n" +
                "  if (activeVal.key(n).time > time) n--;\\n" +
                "}\\n" +
                "if (n <= 0) {\\n" +
                "  t = 0;\\n" +
                "} else {\\n" +
                "  t = time - activeVal.key(n).time;\\n" +
                "}\\n" +
                "if (n > 0 && t < 2) {\\n" +
                "  var val = activeVal.value;\\n" +
                "  var prevVal = (n > 1) ? activeVal.key(n-1).value : 0;\\n" +
                "  var diff = val - prevVal;\\n" +
                "  val - diff * Math.sin(t * freq * Math.PI * 2) / Math.exp(t * decay) * amp;\\n" +
                "} else {\\n" +
                "  activeVal.value;\\n" +
                "}";
            
            smoothSliderProp.expression = bounceExpr;

            var spacing = cfg.spacing;
            var isLeft = (cfg.alignment === "left");
            var xPos = isLeft ? (comp.width * 0.1) : (comp.width / 2);
            var yCenter = comp.height / 2; 

            for (var i = 0; i < lines.length; i++) {
                var l = lines[i];
                var tStart = l.time;
                var tEnd = (i < lines.length - 1) ? lines[i+1].time : (l.time + 5.0);
                
                var tLayer = comp.layers.addText(l.text);
                // ADBE Text Properties -> ADBE Text Document
                var tProp = tLayer.property("ADBE Text Properties").property("ADBE Text Document");
                var tDoc = tProp.value;
                
                tDoc.fontSize = cfg.fontSize;
                tDoc.fillColor = cfg.inactiveColor; 
                tDoc.justification = isLeft ? ParagraphJustification.LEFT_JUSTIFY : ParagraphJustification.CENTER_JUSTIFY;
                try { tDoc.font = cfg.font; } catch (e) {}
                tProp.setValue(tDoc);
                
                tLayer.property("ADBE Transform Group").property("ADBE Position").setValue([xPos, yCenter]);
                tLayer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]); 

                // --- ANIMATOR (Fill & Lift) ---
                
                // Get Text Properties
                var textGroup = tLayer.property("ADBE Text Properties");
                // Get Animators Group
                var animators = textGroup.property("ADBE Text Animators");
                // Add new Animator
                var animGroup = animators.addProperty("ADBE Text Animator");
                animGroup.name = "Highlight Animator";
                
                // ADBE Text Animator Properties
                var animProps = animGroup.property("ADBE Text Animator Properties");
                
                // 1. Fill Color (Turns White)
                var fillProp = animProps.addProperty("ADBE Text Fill Color");
                fillProp.setValue(cfg.textColor);

                // 2. Position Lift (Moves Up)
                // Robust fallback logic for 2D vs 3D position property
                var posProp = null;
                // Helper to safely add property
                function addAnimatorProperty(propsGroup, matchName) {
                    try { return propsGroup.addProperty(matchName); } catch(e) { return null; }
                }
                
                posProp = addAnimatorProperty(animProps, "ADBE Text Position");
                if (!posProp) {
                     posProp = addAnimatorProperty(animProps, "ADBE Text Position 3D");
                }
                
                if (posProp) {
                    // Check dimension of property (2 or 3)
                    if (posProp.value.length === 3) {
                         posProp.setValue([0, -cfg.textLift, 0]);
                    } else {
                         posProp.setValue([0, -cfg.textLift]);
                    }
                }
                
                // Access Range Selector
                var selectors = animGroup.property("ADBE Text Selectors");
                
                // IMPORTANT: Remove existing selectors to ensure clean state
                while (selectors.numProperties > 0) {
                    selectors.property(1).remove();
                }

                // Add a fresh Range Selector
                var rangeSelector = selectors.addProperty("ADBE Text Selector");
                
                // ADBE Text Percent End
                var endProp = rangeSelector.property("ADBE Text Percent End");
                
                // Use ease() instead of linear() for smoother character animation
                var fillExpr = 
                    "ease(time, " + tStart + ", " + tEnd + ", 0, 100);";
                endProp.expression = fillExpr;

                // --- TRANSFORM EXPRESSIONS ---
                // Position
                var posExpr = 
                    "var idx = " + i + ";\\n" +
                    "var activeIdx = thisComp.layer('" + ctrl.name + "').effect('Smooth Index')('ADBE Slider Control-0001');\\n" +
                    "var diff = idx - activeIdx;\\n" +
                    "value + [0, diff * " + spacing + "];";
                tLayer.property("ADBE Transform Group").property("ADBE Position").expression = posExpr;
                
                // Scale
                var scaleExpr = 
                    "var idx = " + i + ";\\n" +
                    "var activeIdx = thisComp.layer('" + ctrl.name + "').effect('Smooth Index')('ADBE Slider Control-0001');\\n" +
                    "var diff = Math.abs(idx - activeIdx);\\n" +
                    "var s = linear(diff, 0, 0.8, " + (cfg.activeScale * 100) + ", 100);\\n" +
                    "[s, s];";
                tLayer.property("ADBE Transform Group").property("ADBE Scale").expression = scaleExpr;
                
                // Opacity
                var opExpr = 
                    "var idx = " + i + ";\\n" +
                    "var activeIdx = thisComp.layer('" + ctrl.name + "').effect('Smooth Index')('ADBE Slider Control-0001');\\n" +
                    "var diff = Math.abs(idx - activeIdx);\\n" +
                    "linear(diff, 1.0, 3.5, 100, " + cfg.inactiveOpacity + ");";
                tLayer.property("ADBE Transform Group").property("ADBE Opacity").expression = opExpr;
                
                // Blur
                var blurEff = tLayer.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
                blurEff.name = "Blur";
                var blurProp = blurEff.property("ADBE Gaussian Blur 2-0001");
                
                var blurExpr = 
                    "var idx = " + i + ";\\n" +
                    "var activeIdx = thisComp.layer('" + ctrl.name + "').effect('Smooth Index')('ADBE Slider Control-0001');\\n" +
                    "var diff = Math.abs(idx - activeIdx);\\n" +
                    "(diff < 0.3) ? 0 : " + cfg.blurMax + ";";
                blurProp.expression = blurExpr;

                if (pb) pb.value = (i / lines.length) * 100;
            }
        }

        var win = buildUI(thisObj);
        if (win instanceof Window) {
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
        }
    }
    LyricalAEScript(this);
}
`;
};

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}`;
}
