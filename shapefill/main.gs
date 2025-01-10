# Collection of filling algorithms ported to goboscript.
# Credits for each algorithm will be provided.

# draw <shape> = draw outline
# fill <shape> = fill in interior of shape

%include std\\math.gs
%include std\\spritecontrol.gs

# -- Capped line by @faretek1 on scratch
costumes "shapefill pencap opaq.svg", "shapefill pencap trans.svg";


proc fill_capped_line x1, y1, x2, y2, th, trans {
    local dst = DIST($x1, $y1, $x2, $y2);
    if dst < $th {
        local mul = ($th / 2) / dst; 

        # tail recursion is ok
        local mdx = ($x1 + $x2) / 2;
        local mdy = ($y1 + $y2) / 2;

        local dx = $x1 - $x2;
        local dy = $y1 - $y2;

        fill_capped_line mdx - dy * mul,
                         mdy + dx * mul,
                         mdx + dy * mul,
                         mdy - dx * mul,
                         dst,
                         $trans;
        
    } else {
        if $trans > 0 {
            local cost = "shapefill pencap trans";
        } else {
            local cost = "shapefill pencap opaq";
        }

        point_in_direction DIR($x1, $y1, $x2, $y2);

        switch_costume cost;
        pos_size_hack $x2 + (dst - $th / 2) * sin(direction()),
                      $y2 + (dst - $th / 2) * cos(direction()),
                      $th;

        set_ghost_effect $trans;
        stamp;
        # set_pen_transparency 100;  # This block doesn't exist yet in goboscript ;-;
        set_pen_size $th;
        pen_down;
        # set_pen_transparency $trans;  # This block doesn't exist yet in goboscript ;-;
        
        turn_right 180;
        pos_size_hack $x1 + (dst - $th / 2) * sin(direction()),
                      $y1 + (dst - $th / 2) * cos(direction()),
                      $th;
        pen_up;
        stamp;
    }
}

# -- Azex fixed res copied over by Triducal
proc fill_tri x1, y1, x2, y2, x3, y3 {
    local la = sqrt(($x2 - $x3) * ($x2 - $x3) + ($y2 - $y3) * ($y2 - $y3));
    local lb = sqrt(($x3 - $x1) * ($x3 - $x1) + ($y3 - $y1) * ($y3 - $y1));
    local lc = sqrt(($x2 - $x1) * ($x2 - $x1) + ($y2 - $y1) * ($y2 - $y1));
    local p = la + lb + lc;

    goto ((la * $x1) + (lb * $x2) + (lc * $x3)) / p,
        ((la * $y1) + (lb * $y2) + (lc * $y3)) / p;

    local a = (x_position() - $x1);
    local b = (y_position() - $y1);
    local c = (x_position() - $x2);
    local d = (y_position() - $y2);
    local e = (x_position() - $x3);
    local f = (y_position() - $y3);
    local r = sqrt((p - la * 2) * (p - lb * 2) * (p - lc * 2) / p);

    if la < lb and la < lc {
        la = 0.5 - (r / (4 * sqrt(a * a + b * b)));
    } else {
        if lb < lc {
            la = 0.5 - (r / (4 * sqrt(c * c + d * d)));
        } else {
            la = 0.5 - (r / (4 * sqrt(e * e + f * f)));
        }
    }

    set_pen_size r;
    pen_down;
    lb = la;

    repeat ceil(-1.6 - (ln(r) / ln(lb))) {
        set_pen_size la * r + 2;
        goto $x1 + (la * a), $y1 + (la * b);
        goto $x2 + (la * c), $y2 + (la * d);
        goto $x3 + (la * e), $y3 + (la * f);
        goto $x1 + (la * a), $y1 + (la * b);
        la = la * lb;
    }

    set_pen_size 2;
    goto $x1, $y1;
    goto $x2, $y2;
    goto $x3, $y3;
    goto $x1, $y1;
    pen_up;
}

onflag {
    forever {
        erase_all;
        fill_capped_line 0, 0, mouse_x(), mouse_y(), 50, 50;
    }
}