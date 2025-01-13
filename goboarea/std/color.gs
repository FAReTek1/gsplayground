# Library by https://scratch.mit.edu/users/faretek1/ for color management and conversion in goboscript :)
# 1/4/2025

%include std\\math.gs
%include std\\string.gs

# --- Color structs ---
# Prefixed with a c to avoid naming conflicts with math.gs's RGB macro
struct cHSV {
    # Hue, saturation, value
    h, s, v
}
struct cRGB {
    # Red, Green, Blue
    # No alpha - would add this if there is a way to do struct value defaulting
    r, g, b
}
struct cRGBA {
    # Red, Green, Blue & Alpha
    r, g, b, a
}
struct cCBGBG {
    # Color brightness1 ghost1 brightness2 ghost2
    # The format that allows setting a sprite to any color
    c, b1, g1, b2, g2 
}
# HEX is just a string here

# -- HSV ---
func HSV_to_CBGBG (cHSV c, alpha) cCBGBG {
    if $alpha == 0{
        return cCBGBG{
            # other values are irrelevant
            g1: 100,
            g2: 100
        };
    }
    
}

# --- RGB ---
func RGB_to_RGBA(cRGB c) cRGBA {
    return cRGBA{
        r: $c.r, g: $c.g, b: $c.b, a: 255
    };
}

# Adapted from https://scratch.mit.edu/projects/623945749/ by @-Rex- on scratch
func RGBA_to_CBGBG(cRGBA c) cCBGBG {
    local a = $c.a / 255;
    if $c.r < $c.g or $c.r < $c.b {
        if $c.g < $c.r or $c.g < $c.b {
            local temp1 = $c.b;
            local temp4 = 133.33333333333333;

            if $c.r > $c.g {
                local temp2 = $c.r;
                local temp3 = $c.g;
                local temp5 = 33.333333333333333;
            } else {
                local temp2 = $c.g;
                local temp3 = $c.r;
                local temp5 = -33.333333333333333;
            }

        } else {
            local temp1 = $c.g;
            local temp4 = 66.66666666666667;

            if $c.r > $c.b {
                local temp2 = $c.r;
                local temp3 = $c.b;
                local temp5 = -33.333333333333333;
            } else {
                local temp2 = $c.b;
                local temp3 = $c.r;
                local temp5 = 33.333333333333333;
            }
        }
    } else {
        local temp1 = $c.r;
        if $c.g > $c.b {
            local temp4 = 0;
            local temp2 = $c.g;
            local temp3 = $c.b;
            local temp5 = 33.333333333333333;
        } else {
            local temp4 = 200;
            local temp2 = $c.b;
            local temp3 = $c.g;
            local temp5 = -33.333333333333333;
        }
    }

    local cCBGBG ret = cCBGBG{};
    if temp1 < 128 {
        ret.b2 = 100;
        ret.b1 = (255 * (temp1 - temp3)) / (255 - temp3);
        ret.c = temp4 + temp5 * ((((255 * (temp2 - temp3)) / (255 - temp3)) + (255 - ret.b1)) / 255);
        ret.b1 = 0.39215686274509803 * ret.b1 - 100;
        ret.g2 = 100 - 0.39215686274509803 * temp3;
    } else {
        ret.b2 = -100;
        ret.b1 = 100 * (temp3 / temp1);
        ret.c = temp4 + temp5 * ((temp2 - temp3) / temp1);
        ret.g2 = 0.39215686274509803 * temp1;
    }

    if a >= 1 {
        ret.g1 = 0;
    } elif a > 0 {
        ret.g1 = 100 - 100 * ((a * ret.g2) / (100 - (a * (100 - ret.g2))));
        ret.g2 = 100 - a * (100 - ret.g2);
    } else {
        ret.g1 = 0;
        ret.g2 = 0;
    }

    if ret.g2 <= 0 {
        ret.g1 = 100;
    }

    return ret;
}

# --- HEX ---
func HEX_to_RGB (hex) cRGB {
    return cRGB{
        r: HEX(slice($hex, 1, 2)),
        g: HEX(slice($hex, 3, 4)),
        b: HEX(slice($hex, 5, 6))
    };
}

# --- CBGBG ---
proc CBGBG_stamp cCBGBG c {
    if $c.g1 < 100 {
        set_color_effect $c.c;
        set_brightness_effect $c.b1;
        set_ghost_effect $c.g1;
        stamp;
    }
    if $c.g2 < 100 {
        set_brightness_effect $c.b2;
        set_ghost_effect $c.g2;
        stamp;
    }
}

# --- Color FX ---
func clamp_RGB (cRGB c) cRGB {
    # Floor an RGB and clamp it
    return cRGB {
        r: floor(CLAMP($c.r, 0, 255)),
        g: floor(CLAMP($c.g, 0, 255)),
        b: floor(CLAMP($c.b, 0, 255))
    };
}

# The functions starting with an underscore are inner functions
func _posterise_value(i) {
    if $i < 128 {
        if $i < 64 {
            return 31;
        } else {
            return 95;
        }
    } else {
        if $i < 192 {
            return 159;
        } else {
            return 223;
        }
    }
}

func posterise_RGB (cRGB c) cRGB {
    return cRGB {
        r: _posterise_value($c.r),
        g: _posterise_value($c.g),
        b: _posterise_value($c.b)
    };
}

func sepia_RGB (cRGB c) cRGB {
    return clamp_RGB(cRGB{
        r: (0.393 * $c.r + 0.769 * $c.g + 0.189 * $c.b),
        g: (0.349 * $c.r + 0.686 * $c.g + 0.168 * $c.b),
        b: (0.272 * $c.r + 0.534 * $c.g + 0.131 * $c.b)
    });
}

func invert_RGB (cRGB c) cRGB {
    return clamp_RGB(cRGB{
        r: 255-$c.r,
        g: 255-$c.g,
        b: 255-$c.b
    });
}

func NTSC_gray_RGB (cRGB c) cRGB {
    # Convert an RGB to grayscale using the NTSC formula
    local val = round(0.299 * $c.r + 0.587 * $c.g + 0.114 * $c.b);
    return cRGB{r: val, g: val, b: val};
}

func gray_RGB (cRGB c) cRGB {
    # Convert an RGB to grayscale by taking an average
    local val = round(($c.r + $c.g + $c.b) / 3);
    return cRGB{r: val, g: val, b: val};
}

func _solarise_value(v, threshold) {
    if $v < $threshold {
        return 255 - $v;
    } else {
        return $v;
    }
}

func solarize (cRGB c, threshold) cRGB {
    return cRGB{
        r: _solarise_value($c.r, $threshold),
        g: _solarise_value($c.g, $threshold),
        b: _solarise_value($c.b, $threshold)
    };
}
