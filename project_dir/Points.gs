variables Index, clone, dist, dx, dy, dir, i, true_x, true_y;
lists ;
costumes "Points/Point.svg", "Points/Point2.svg", "Points/Point3.svg", "Points/m.svg", "Points/Point4.svg";

onflag {
    __Setup;
    forever {
        broadcast "draw";
        broadcast "tick";
        broadcast "end";
        calc_true_pts;
    }
}

onclone {
    clone = 1;
    show;
    goto _pts[Index * 2 - 1], _pts[Index * 2];
    true_x = x();
    true_y = y();
}

proc __Setup {
    clone = 0;
    hide;
    Index = 0;
    repeat _pts.length / 2 {
        Index += 1;
        cloneself;
    }
}

onkey "r" {
    repeat 1 {
        deleteclone;
    }
    reset;
}

proc reset {
    Index = 0;
    _pts = [];
    add 5, not false, "", "";
}

onkey "space" {
    if clone = 0 {
        add 1, mousex(), mousey();
        waituntil not keydown("space");
    }
}

proc add REM, rand, x, y {
    repeat $REM {
        Index += 1;
        if false {
            _pts.add round(random(-240, 240) / 20) * 20;
            _pts.add round(random(-150, 100) / 20) * 20;
        }
        else {
            _pts.add $x;
            _pts.add $y;
        }
        cloneself;
    }
}

proc Tick {
    if clone = 1 {
        if mode = 0 {
            show;
        }
        elif Index > 2 {
            hide;
        }
        setcoloreffect 20 * (Index - 1);
        dist__dist mx, my, true_x, true_y;
        setghosteffect 30;
        if dist < 24 {
            setghosteffect 20;
            if drag = 0 {
                if mousedown() {
                    setghosteffect 0;
                    dx = mousex() - _pts[Index * 2 - 1];
                    dy = mousey() - _pts[Index * 2];
                    goto mousex(), mousey();
                    drag = 1;
                }
            }
            if keydown("x") {
                _pts[Index * 2 - 1] = nan;
                _pts[Index * 2] = nan;
                deleteclone;
            }
        }
        switchcostume "Point";
        true_x = x();
        true_y = y();
        _pts[Index * 2 - 1] = round(x() / grid_size) * grid_size;
        _pts[Index * 2] = round(y() / grid_size) * grid_size;
        goto _pts[Index * 2 - 1], _pts[Index * 2];
    }
    else {
        hide;
    }
}

on "tick" {
    Tick;
}

proc dist__dist x1, y1, x2, y2 {
    dist = sqrt(($x1 - $x2) * ($x1 - $x2) + ($y1 - $y2) * ($y1 - $y2));
}

on "end" {
    mx = mousex();
    my = mousey();
}

nowarp proc dir__dir x, y, cx, cy {
    dir = atan(($x - $cx) / ($y - $cy)) + ($cy > $y) * 180;
}

proc calc_true_pts {
    pts = [];
    i = 1;
    repeat _pts.length {
        if _pts[i] != nan {
            pts.add _pts[i];
        }
        i += 1;
    }
    drag = 0;
}

