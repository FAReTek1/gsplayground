# Package for dealing with random and useful maths stuff

%include std\\cmath.gs

%define TAU 6.283185307179586 # PI * 2
%define GOLDEN_RATIO 1.618033988749895 # (1 + sqrt 5) / 2

list lanczos_coefs = [ # For some reason gs doesn't seem to work with negative numbers here, so I made them into strings
    "0.99999999999980993",
    "676.5203681218851",
    "-1259.1392167224028",
    "771.32342877765313",
    "-176.61502916214059",
    "12.507343278686905",
    "-0.13857109526572012",
    "9.9843695780195716e-6",
    "1.5056327351493116e-7"
];

# - functions that maybe should be in the standard math library -
%define LOGB(b,x) ln(x) / ln(b)
%define SGNBOOL(b) 1 - (2 * (b)) # Goboscript weirdness requires these brackets
func safepow(x, y) {
    # Power function that always works so long as it's not a complex result
    return (POW(abs($x), $y)) * (SGNBOOL($x < 0 and $y % 2 == 1));
}
# Return nth root of x
%define NROOT(n, x) antiln(ln(x) / n)

# - random functions -
func gamma(x) {
    # Get gamma (factorial extension with shift) of a number (non complex)
    # https://literateprograms.org/gamma_function_with_the_lanczos_approximation__python_.html
    if $x < 0.5 {
        return PI / (sin(180 * $x) * gamma(1 - $x));
    } else {
        local v = lanczos_coefs[1];
        local i = 2;
        repeat 8 {
            v += lanczos_coefs[i] / (($x - 2) + i);
            i ++;
        }
        return 2.506628267370251 * safepow($x + 6.5, $x - 0.5) * v * antiln(-1 * ($x + 6.5));
    }
}

func stirlings_approx(n) {
    return sqrt(6.283185307179586 * $n) * POW($n / 2.718281828459045, $n);
}

func burnsides_approx(n) {
    # https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=10fb33b0e1216656f24acbccbf4bdca027ff39d3
    # Burnside's asymptotic formula for the gamma/extented factorial function
    # 2.5066282746310002 = sqrt(tau)
    return 2.5066282746310002 * POW(($n + 0.5) / 2.718281828459045, $n + 0.5);
}

func lambert_w_approx(x){ # Very inaccurate but 'faster' lambert w approximation
    return ln($x / ln($x / ln($x / ln($x / ln($x / ln($x / ln($x)))))));
}
# - smooth min & max from blender apparently -
func smooth_min(x, y, s) { # s = smoothing factor
    local c = (MAX($s - abs($x - $y), 0)) / $s;
    return MIN($x, $y) - (($s/6) * c * c * c);
}

func smooth_max(x, y, s) { # s = smoothing factor
    local c = (MAX($s - abs($x - $y), 0)) / $s;
    return MAX($x, $y) + (($s/6) * c * c * c);
}

# - polynomial solvers -
struct Ret2 {a, b} # Simple struct for returning 2 values :\
struct Ret3 {a, b, c}
struct Ret4 {a, b, c, d}

func solve_quadractic(a, b, c) Ret2 {
    local discrim = $b * $b - 4 * $a * $c;
    if discrim < 0 {
        # complex
        # Return complex numbers as strings
        # there is a function for this in the cmath library
    } else {
        discrim = sqrt(discrim);
        return Ret2 {
            a: (discrim - $b) / (2 * $a);
            b: (discrim + $b) / (-2 * $a);
        };
    }
}

# func solve_cubic(a, b, c, d) Ret3 {
#     
# }

# func solve_quartic(a, b, c, d, e) Ret4 {
#     
# }


# -- demo code --

costumes "blank.svg";

onflag{
    erase_all;
    say GOLDEN_RATIO;
    say LOGB(2, 8);
    say gamma(16);

    i = -240;
    x = -240;
    repeat 480 {
        goto x, lambert_w_approx(i);

        pen_down;

        x ++;
        i += 480.0 / 480;
    }
    pen_up;
}
