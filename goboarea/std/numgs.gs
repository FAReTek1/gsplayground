# Package for dealing with random and useful maths stuff

%include std\\string.gs
%include std\\cmath.gs
# cmath includes math

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

func tri_num(n) {
    return ($n * $n + $n) / 2;
}

func choose(n, k) {
    return gamma($n + 1) / (gamma($k + 1) * gamma($n - $k + 1));
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
            a: (discrim - $b) / (2 * $a),
            b: (discrim + $b) / (-2 * $a)
        };
    }
}

# https://turbowarp.org/913918502/editor
# func solve_cubic(a, b, c, d) Ret3 {
#     
# }

# func solve_quartic(a, b, c, d, e) Ret4 {
#     
# }

# - prime number sieves -
# only 1 rn ;-;

# https://www.geeksforgeeks.org/sieve-of-atkin/
list atkin_primes;
list _sieve_of_atkin;
proc sieve_of_atkin limit {
    # 2 and 3 are known
    # to be prime
    if $limit > 2 {
        add 2 to atkin_primes;
        if $limit > 3 {
            add 3 to atkin_primes;
        }
    }

    # Initialise the sieve
    # array with False values
    delete atkin_primes;
    delete _sieve_of_atkin;

    repeat $limit {add false to _sieve_of_atkin;}

    # Mark sieve[n] is True if
    # one of the following is True:

    # a) n = (4*x*x)+(y*y) has odd
    #    number of solutions, i.e.,
    #    there exist odd number of
    #    distinct pairs (x, y) that
    #    satisfy the equation and
    #    n % 12 = 1 or n % 12 = 5.

    # b) n = (3*x*x)+(y*y) has
    #    odd number of solutions
    #    and n % 12 = 7

    # c) n = (3*x*x)-(y*y) has
    #    odd number of solutions,
    #    x > y and n % 12 = 11

    local i = 1;
    until (i * i) > $limit {
        local j = 1;
        until (j * j) > $limit {
            # Main part of
            # Sieve of Atkin
            local cmp = 4 * i * i + j * j;
            if cmp <= $limit and (cmp % 12 == 1 or cmp % 12 == 5) {
                _sieve_of_atkin[cmp] = not _sieve_of_atkin[cmp];
            }

            cmp = 3 * i * i + j * j;
            if cmp <= $limit and cmp % 12 == 7 {
                _sieve_of_atkin[cmp] = not _sieve_of_atkin[cmp];
            }

            cmp = 3 * i * i - j * j;
            if cmp <= $limit and i > j and cmp % 12 == 11 {
                _sieve_of_atkin[cmp] = not _sieve_of_atkin[cmp];
            }

            j ++;
        }
        i ++;
    }

    # Mark all multiples of
    # squares as non-prime
    local i = 5;
    until (i * i) > $limit {
        if _sieve_of_atkin[i] {
            local sq = i * i;
            until sq > $limit {
                _sieve_of_atkin[sq] = false;
                sq += i * i;                
            }
        }
        i ++;
    }
    
    # Return primes
    # using sieve[]

    i = 1;
    repeat length _sieve_of_atkin{
        if _sieve_of_atkin[i] {
            add i to atkin_primes;
        }
        i++;
    }
}

# - Bases -
%define B10_DIGITS "0123456789"
%define B2_DIGITS "01"
%define B8_DIGITS "01234567"
%define B16_DIGITS "0123456789ABCDEF"

# Based on https://www.rapidtables.com/convert/number/base-converter.html
func convert_base(val, og_digits, new_digits) {
    local og_base = length $og_digits;
    local new_base = length $new_digits;
    
    # Convert to base 10
    local b10 = 0;
    local i = 1;
    repeat length $val {
        b10 += (findchar($og_digits, $val[i]) - 1) * POW(og_base, length $val - i);
        i++;
    }

    ret = "";
    until b10 < 1 {
        ret = $new_digits[b10 % new_base + 1] & ret;
        b10 /= new_base;        
    }
    return ret;
}

func convert_base_dp(val, og_digits, new_digits, res) {
    local dpi = findchar($val, ".");

    if dpi == 0 {
        return convert_base($val, $og_digits, $new_digits);
    }

    local og_base = length $og_digits;
    local new_base = length $new_digits;

    local whole = slice($val, 1, dpi - 1);
    local dec = slice($val, dpi + 1, length $val);

    local b10 = 0;
    local i = 1;
    repeat length whole {
        b10 += (findchar($og_digits, whole[i]) - 1) * POW(og_base, length whole - i);
        i++;
    }

    i = 1;
    repeat length dec{
        b10 += (findchar($og_digits, dec[i]) - 1) * POW(og_base, -i);
        i++;
    }

    b10 = floor(b10 * POW(new_base, $res));
    local ret = convert_base(b10, "0123456789", $new_digits);

    local dpi = length ret - $res;    
    return slice(ret, 1, dpi) & "." & slice(ret, dpi + 1, length ret);
}
