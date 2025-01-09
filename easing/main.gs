# Implementation of https://easings.net/ in goboscript.
# Written by faretek1.

%include std\\math.gs

# - macros/func which might want to be added to other modules -
%define SGNBOOL(b) 1 - (2 * (b)) # Goboscript weirdness requires these brackets

func safepow(x, y) {
    # Power function that always works so long as it's not a complex result
    return (POW(abs($x), $y)) * (SGNBOOL($x < 0 and $y % 2 == 1));
}

# Macro to get the timer value for use in easings. Redefine to allow configuration
%define etime() timer()

# - utility functions -
func get_back_bounce_constant(p) {
    # Formula from Vaschex on stackoverflow (optimised):
    # https://stackoverflow.com/questions/46624541/how-to-calculate-this-constant-in-various-easing-functions
    # Allows you to calculate a different value that 1.70158 for the back easing. 1.70158 = 10% bounce
    
    local p = $p / 10;
    local m27p = -27 * p;
    local m27p_sqrd = m27p * m27p;

    local c1 = ((-1166400 * p + 2 * m27p_sqrd * m27p) - 524880 * p * p) / 3456000;
    local c2 = sqrt(c1 * c1 + (-6480 * p - m27p_sqrd) * (-6480 * p - m27p_sqrd) * (-6480 * p - m27p_sqrd) / 2985984000000);

    return POW(c2 - c1, 1.0 / 3.0) + 
           POW(-c1 - c2, 1.0 / 3.0) 
           - m27p / 120;
}

# - inner easing functions -

%define _easeinsine(x) 1 - cos(90 * x)
%define _easeoutsine(x) sin(90 * x)
%define _easeinoutsine(x) (1 - cos(180 * x)) / 2

func _easeinpow(x, rate) {
    return POW($x, $rate);
}
func _easeoutpow(x, rate) {
    return 1 - POW(1 - $x, $rate);
}
func _easeinoutpow(x, rate) {
    if $x < 0.5 {
        return POW(2 * $x, $rate) / 2;
    } else {
        return 1 - POW(2 - 2 * $x, $rate) / 2;
    }
}

%define _easeinexpo(x) antiln(6.931471805599453 * (x-1)) + (1 - x) * 0.0009765625
%define _easeoutexpo(x) 1 - (antiln(-6.931471805599453 * x) + x * 0.0009765625)
func _easeinoutexpo(x) {
    if $x < 0.5 {
        return 0.5 * (antiln(13.862943611198906 * $x - 6.931471805599453) + 0.0009765625 - (0.001953125 * $x));
    } else {
        return 0.5 * (2 - (antiln(-13.862943611198906 * ($x - 0.5) + 0.001953125 * ($x - 0.5))));
    }
}

%define _easeincirc(x) 1 - sqrt(1 - x * x)
%define _easeoutcirc(x) sqrt(1 - (1 - x) * (1 - x))
func _easeinoutcirc(x) {
    if $x < 0.5 {
        return 0.5 * (1 - sqrt(1 - 4 * $x * $x));
    } else {
        return 0.5 + 0.5 * sqrt(1 - 4 * (1 - $x) * (1 - $x));
    }
}

%define _easeinback(x) x * x * ((1.70158 + 1) * x - 1.70158)
%define _easeoutback(x) 1 - (1 - x) * (1 - x) * ((1.70158 + 1) * (1 - x) - 1.70158)
func _easeinoutback(x) {
    # unoptimised
    if $x < 0.5 {
        return 0.5 * _easeinback(2 * $x);
    } else {
        return (1 + _easeoutback(2 * $x - 1)) / 2;
    }
}

%define _easeinelastic(x) sin(1200 * x - 1290) * (0.0009765625 * (x - 1) - antiln(6.931471805599453 * x - 6.931471805599453))
%define _easeoutelastic(x) 1 - sin(90 + 1200 * x) * (antiln(-6.931471805599453 * x) - 0.0009765625 * x)
func _easeinoutelastic(x) {
    # unoptimised
    if $x < 0.5 {
        return 0.5 * _easeinelastic(2 * $x);
    } else {
        return (2 - _easeinelastic((1 - $x) * 2)) / 2; # strangely, if you change (1 - $x) * 2) to 2 - $x * 2, the compiler, trying to be smart, actually breaks the code
    }
}

func _easeinbounce(x) {
    if $x > 0.636363636364 {
        return 1 - 7.5625 * (1 - $x) * (1 - $x);
    } elif $x > 0.27272727272700004 {
        return 0.25 - 7.5625 * (0.45454545454499995 - $x) * (0.45454545454499995 - $x);
    } elif $x > 0.09090909090900001 {
        return 0.0625 - 7.5625 * (0.18181818181800002 - $x) * (0.18181818181800002 - $x);
    } else {
        return 0.015625 - 7.5625 * (0.04545454545500005 - $x) * (0.04545454545500005 - $x);
    }
}
%define _easeoutbounce(x) 1 - _easeinbounce(1-x)
func _easeinoutbounce(x) {
    # unoptimised
    if $x < 0.5 {
        return 0.5 * _easeinbounce(2 * $x);
    } else {
        return (2 - _easeinbounce((1 - $x) * 2)) / 2; # strangely, if you change (1 - $x) * 2) to 2 - $x * 2, the compiler, trying to be smart, actually breaks the code
    }
}

# - easing wrapper things -
# ease 
# time:
#     - from time that lasts for x seconds
#     - from time a to time b
# style
#     - style name + inout
#     - concatenate stylename & inout
# values
#     - from v1 to v2
#     - from v1 to v1 + x
#     - from 0 to x

func ease(x, type, inout) {

    if $type == $type + "" {
        if $inout == "in" {
            return _easeinpow($x, $type);
        } elif $inout == "out" {
            return _easeoutpow($x, $type);
        } else {
            return _easeinoutpow($x, $type);
        }
    }

    elif $type == "sine" {
        if $inout == "in" {
            return _easeinsine($x);
        } elif $inout == "out" {
            return _easeoutsine($x);
        } else {
            return _easeinoutsine($x);
        }
    }

    elif $type == "expo" {
        if $inout == "in" {
            return _easeinexpo($x);
        } elif $inout == "out" {
            return _easeoutexpo($x);
        } else {
            return _easeinoutexpo($x);
        }
    }

    elif $type == "circ" {
        if $inout == "in" {
            return _easeincirc($x);
        } elif $inout == "out" {
            return _easeoutcirc($x);
        } else {
            return _easeinoutcirc($x);
        }
    }

    elif $type == "back" {
        if $inout == "in" {
            return _easeinback($x);
        } elif $inout == "out" {
            return _easeoutback($x);
        } else {
            return _easeinoutback($x);
        }
    }
    
    elif $type == "elastic" {
        if $inout == "in" {
            return _easeinelastic($x);
        } elif $inout == "out" {
            return _easeoutelastic($x);
        } else {
            return _easeinoutelastic($x);
        }
    }

    elif $type == "bounce" {
        if $inout == "in" {
            return _easeinbounce($x);
        } elif $inout == "out" {
            return _easeoutbounce($x);
        } else {
            return _easeinoutbounce($x);
        }
    }
}

# - demo code -

costumes "dango cat.svg";

proc stp {
    erase_all;
    goto -240, 0;
    i = 0;
    repeat 240 {
        set_y ease(i, "bounce", "in") * 100;
        pen_down;

        change_x 1;

        i += 1.0 / 240;
    }
    pen_up;
    goto 0,0;
}

onflag {
    stp;
    say get_back_bounce_constant(10);

    forever{
        point_in_direction 360 * ease((etime() / 1) % 1, "bounce", "inout");
    }
}
