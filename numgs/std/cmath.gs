%include std\\math.gs

# --- Complex struct ---

struct Complex {
    real,
    imag
}

func complex(real, imag) Complex {
    # This reduces the amount of 'boilerplate' code for making complex structs.

    return Complex{
        real: $real,
        imag: $imag
    };
}

func c_tostr(Complex z) {
    if $z.imag > 0 {
        return $z.real & " + " $z.imag & "i";
    } else {
        return $z.real & " - " -$z.imag & "i";
    }
}

# --- Basic operations ---
# Perhaps these should be macros? I don't know...
func c_add(Complex a, Complex b) Complex {
    return Complex{
        real: $a.real + $b.real,
        imag: $a.imag + $b.imag
    };
}

func c_sub(Complex a, Complex b) Complex {
    return Complex{
        real: $a.real - $b.real,
        imag: $a.imag - $b.imag
    };
}

func c_mul(Complex a, Complex b) Complex {
    return Complex{
        real: $a.real * $b.real - $a.imag * $b.imag,
        imag: $a.real * $b.imag + $a.imag * $b.real
    };
}

func c_div(Complex a, Complex b) Complex {
    local denom = $b.real * $b.real + $b.imag * $b.imag;

    return Complex{
        real: ($a.real * $b.real + $a.imag * $b.imag) / denom,
        imag: ($a.imag * $b.real - $a.real * $b.imag) / denom
    };
}

# No power operator here because it uses exp and ln

# --- Advanced functions ---
func c_abs(Complex z) {
    return sqrt($z.real * $z.real + $z.imag * $z.imag);
}

func c_arg(Complex z) {
    return ATAN2($z.imag, $z.real);
}

func c_sgn(complex z) Complex {
    # Complex number on the unit circle that is in the direction of the complex number z
    return c_div(
        $z, Complex{
            real: c_abs($z),
            imag: 0
        }
    );
}

func c_exp(Complex z) Complex {
    # Same as antiln
    return Complex {
        real: antiln($z.real) * cos($z.imag * 57.2957795131),
        imag: antiln($z.real) * sin($z.imag * 57.2957795131)
    };
} 

func c_ln(Complex z) Complex {
    return Complex {
        real: ln(c_abs($z)),
        imag: ATAN2($z.imag, $z.real)
    };
}

func c_pow(Complex a, Complex b) Complex {
    return c_exp(
        c_mul($b, c_ln($a))
    );
}

func c_conj(Complex z) Complex {
    return Complex {
        real: $z.real,
        imag: -$z.imag
    };
}

func c_sqrt(Complex z) Complex {
    return c_pow($z, Complex{real: 0.5, imag: 0});
}

# --- Trigonometric functions ---
func c_sin(Complex z) Complex {
    return c_div(c_sub(
        c_exp(Complex{real: -$z.imag, imag: $z.real}), 
        c_exp(Complex{real: $z.imag, imag: -$z.real})
    ), Complex{real: 0, imag:2});
}

func c_cos(Complex z) Complex {
    return c_div(c_add(
        c_exp(Complex{real: -$z.imag, imag: $z.real}), 
        c_exp(Complex{real: $z.imag, imag: -$z.real})
    ), Complex{real: 2, imag:0});
}

func c_tan(Complex z) Complex {
    # Yeah I didn't have this pre-coded so this is a lazy implementation
    return c_div(
        c_sin($z), c_cos($z)
    );
}

# --- Inverse trigonometric functions ---

func c_asin(Complex z) Complex {
    return c_mul(
        c_ln(
            c_add(
                Complex{real:-$z.imag, imag:$z.real},
                c_sqrt(
                    c_sub(
                        Complex{real:1, imag:0}, 
                        c_mul($z, $z)
                    )
                )
            )
        ),
        Complex{real:0, imag:-1}
    );
}

func c_acos(Complex z) Complex {
    local Complex a = c_sqrt(
                    c_sub(
                        Complex{real:1, imag:0}, 
                        c_mul($z, $z)
                    )
                );

    return 
    c_mul(
        c_ln(
            c_add(
                $z,
                Complex{
                    real:-a.imag, imag:a.real
                }
            )
        ),
        Complex{real:0, imag:-1}
    );
}

func c_atan(Complex z) Complex {
    return 
    c_mul(c_ln(
        c_div(
            Complex{real: $z.real, imag: $z.imag + 1},
            Complex{real: -$z.real, imag: 1-$z.imag}
        )
    ), Complex{real: 0, imag:0.5});
}

# --- Hyperbolic trigonometric functions ---
func c_sinh(Complex z) Complex {
    return Complex{
        real: SINH($z.real) * cos($z.imag * 57.2957795131),
        imag: COSH($z.real) * sin($z.imag * 57.2957795131)
    };
}

func c_cosh(Complex z) Complex {
    return Complex{
        real: COSH($z.real) * cos($z.imag * 57.2957795131),
        imag: -SINH($z.real) * sin($z.imag * 57.2957795131)
    };
}

# --- Inverse hyperbolic trigonometric functions ---
func c_asinh(Complex z) Complex {
    # This might need to be improved
    return 
    c_ln(
        c_add(
            $z,
            c_sqrt(
                c_add(
                    c_mul($z, $z), 
                    Complex{real:1, imag:0}
                )
            )
        )
    );
}

func c_acosh(Complex z) Complex {
    local Complex a = c_mul($z, $z);

    return 
    c_ln(
        c_div(
            $z,
            c_sqrt(Complex{real:-a.real, imag:a.imag})
        )
    );
}
