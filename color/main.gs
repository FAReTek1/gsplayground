# Library by https://scratch.mit.edu/users/faretek1/ for color management and conversion in goboscript :)
# 1/4/2025

%include std\\math.gs
%include std\\string.gs
# ^^ literally why goboscript is so nice

costumes "blank.svg";

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

# --- Demo code ---

onflag {
    # cRGB c = solarize(cRGB{
    #     r: 213, 
    #     g: 123,
    #     b: 65
    # }, 123);

    # say "r: " & c.r & " g: " & c.g & " b: " & c.b;

    # cCBGBG c = cCBGBG{
    #     c: 50, 
    #     b1: 50, 
    #     g1: 0,
    #     b2: 70, 
    #     g2: 90
    # };

    # CBGBG_stamp(c);

    # cRGB c2 = HEX_to_RGB("123456");

    cHSV c = cHSV {
        h: 50,
        s: 75,
        v: 90
    };

    cCBGBG c2 = HSV_to_CBGBG(c, 0);
}
