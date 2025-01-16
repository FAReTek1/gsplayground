variables ctc__flip, ctc__i, ctc__normal_v, ctc__normal_x, ctc__normal_y, tri__res, demo__size, demo__angle, _1, _2, _3, _4, _tris, ctc__a, ctc__b, ctc__c, count, current, ctc__d1, ctc__d2, ctc__first, ctc__intercept, ctc__m, ctc__previous, start_timer, ctc__t, total, ctc__x, ctc__y, ctc__j, demo__i, cx, cy, cr;
lists clip__buffer2, clip__clip_poly, clip__buffer1;
costumes "Clipper/costume1.svg", "Clipper/costume2.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}costume1.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}0.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}1.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}2.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}3.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}4.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}5.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}6.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}7.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}8.svg", "Clipper/SegmentFill{{fwslash}}{{fwslash}}9.svg";

proc canvas__create_segment_ x, y, r, angle1, angle2 {
    if $angle1 = $angle2 {
        return;
    }
    if $r * 2 < 100 {
        switchcostume "costume2";
    }
    else {
        switchcostume "costume1";
    }
    setsize $r * 2;
    goto $x, $y;
    point floor(ln(($angle2 - $angle1) / 0.703125) / 0.6931471805599453);
    switchcostume "SegmentFill//" & ($angle2 - $angle1 > 0.703125) * direction();
    point $angle2 - ceil(0.703125 * antilog(0.30102999566398114 * direction()));
    stamp;
    point $angle1;
    stamp;
    __Azex_3D $r * sin($angle1) + $x, $r * cos($angle1) + $y, $r * sin($angle2) + $x, $r * cos($angle2) + $y, $r * sin(($angle1 + $angle2) / 2) + $x, $r * cos(($angle1 + $angle2) / 2) + $y;
}

proc zz__inner_circlengon__segment_by_coords_ x1, y1, x2, y2, x, y, r {
    ctc__d1 = (atan(($x1 - $x) / ($y1 - $y)) + 180 * ($y1 - $y < 0)) % 360;
    ctc__d2 = (atan(($x2 - $x) / ($y2 - $y)) + 180 * ($y2 - $y < 0)) % 360;
    if ctc__d1 = ctc__d2 {
        return;
    }
    if ctc__flip = 1 {
        if ctc__d1 < ctc__d2 {
            canvas__create_segment_ $x, $y, $r, ctc__d1, ctc__d2;
            return;
        }
        canvas__create_segment_ $x, $y, $r, ctc__d1 - 360, ctc__d2;
        return;
    }
    if ctc__d2 < ctc__d1 {
        canvas__create_segment_ $x, $y, $r, ctc__d2, ctc__d1;
        return;
    }
    canvas__create_segment_ $x, $y, $r, ctc__d2 - 360, ctc__d1;
}

proc _z_Azex_Optimized_DOT_Draw ina, inb, inc, ind, ine, inf, inr, a, b, c, d, e, f {
    _tris += 1;
    if _1 < _2 and _1 < _3 {
        _4 = 0.5 - $inr / (4 * sqrt($ina * $ina + $inb * $inb));
    }
    elif _2 < _3 {
        _4 = 0.5 - $inr / (4 * sqrt($inc * $inc + $ind * $ind));
    }
    else {
        _4 = 0.5 - $inr / (4 * sqrt($ine * $ine + $inf * $inf));
    }
    setpensize $inr;
    pendown;
    _2 = _4;
    repeat ceil(ln(tri__res / $inr) / ln(_2) * 0.75) {
        setpensize _4 * $inr + 0.5;
        goto $a + _4 * $ina, $b + _4 * $inb;
        goto $c + _4 * $inc, $d + _4 * $ind;
        goto $e + _4 * $ine, $f + _4 * $inf;
        goto $a + _4 * $ina, $b + _4 * $inb;
        _4 *= _2;
    }
    setpensize tri__res;
    goto $a, $b;
    goto $c, $d;
    goto $e, $f;
    goto $a, $b;
    penup;
}

proc clip__circlengon_ x, y, r {
    ctc__i = 1;
    repeat clip__clip_poly.length / 2 {
        ctc__d1 = (clip__clip_poly[ctc__i] - $x) * (clip__clip_poly[ctc__i] - $x) + (clip__clip_poly[ctc__i + 1] - $y) * (clip__clip_poly[ctc__i + 1] - $y);
        if ctc__d1 = $r * $r {
            clip__circlengon_ $x, $y + 0.5, $r;
            return;
        }
        ctc__i += 2;
    }
    clip__buffer1 = [];
    clip__buffer2 = [];
    ctc__normal_x = clip__clip_poly[4] - clip__clip_poly[2];
    ctc__normal_y = clip__clip_poly[1] - clip__clip_poly[3];
    ctc__normal_v = ctc__normal_x * clip__clip_poly[1] + ctc__normal_y * clip__clip_poly[2];
    ctc__flip = 2 * (ctc__normal_x * clip__clip_poly[5] + ctc__normal_y * clip__clip_poly[6] > ctc__normal_v) - 1;
    ctc__j = clip__clip_poly.length - 1;
    ctc__i = 1;
    zz__inner_circlengon__get_current clip__clip_poly[ctc__j] - $x, $y - clip__clip_poly[ctc__j + 1], $r;
    ctc__previous = current;
    ctc__first = ctc__previous;
    repeat clip__clip_poly.length / 2 {
        zz__inner_circlengon__get_current clip__clip_poly[ctc__i] - $x, $y - clip__clip_poly[ctc__i + 1], $r;
        if ctc__previous = 1 {
            clip__buffer1.add clip__clip_poly[ctc__j];
            clip__buffer1.add clip__clip_poly[ctc__j + 1];
        }
        if current = 0 or ctc__previous = 0 {
            zz__inner_circlengon__circleline_intersect_ clip__clip_poly[ctc__j], clip__clip_poly[ctc__j + 1], clip__clip_poly[ctc__i], clip__clip_poly[ctc__i + 1], $x, $y, $r;
        }
        ctc__previous = current;
        ctc__j = ctc__i;
        ctc__i += 2;
    }
    if clip__buffer1.length = 0 {
        ctc__circle_check $x, $y, $r;
    }
}

onflag {
    resettimer;
    total = 0;
    count = 0;
    forever {
        render;
    }
}

proc render {
    clear;
    setpencolor "#5a5a5a";
    setpentransparency 50;
    cx = (pts[1] + pts[3]) / 2;
    cy = (pts[2] + pts[4]) / 2;
    cr = 0.5 * sqrt((pts[1] - pts[3]) * (pts[1] - pts[3]) + (pts[2] - pts[4]) * (pts[2] - pts[4]));
    goto cx, cy;
    setpensize 2 * cr;
    pendown;
    penup;
    demo__place_ngon;
    setpencolor "#800000";
    setpentransparency 50 * mousedown();
    setbrightnesseffect -50;
    setghosteffect 50 * mousedown();
    start_timer = dayssince2000();
    repeat batch {
        clip__circlengon_ round(cx), round(cy), round(cr);
    }
    ctc__fill_circlengon_clip_ round(cx), round(cy), round(cr);
    clipssecond = batch / ((dayssince2000() - start_timer) * 86400);
    demo__draw_clip_shape;
    if timer() > 2 {
        total += 1;
        count += clipssecond;
        average = count / total;
    }
    if mousey() > 110 and mousedown() {
        radius.hide;
        grid_size.hide;
    }
    else {
        radius.show;
        grid_size.show;
    }
    if mousey() > 140 and mousedown() {
        sides.hide;
        batch.hide;
        mode.hide;
    }
    else {
        sides.show;
        batch.show;
        mode.show;
    }
    if mousey() < -160 and mousedown() {
        clipssecond.hide;
        average.hide;
    }
    else {
        clipssecond.show;
        average.show;
    }
}

proc demo__place_ngon {
    clip__clip_poly = [];
    if mode = 1 {
        if sides > 3 {
            demo__angle = 180 + 180 / sides;
            demo__size = radius;
            repeat sides {
                clip_poly__add_ sin(demo__angle) * radius, cos(demo__angle) * radius;
                demo__angle += 360 / sides;
            }
        }
        else {
            clip_poly__add_ sin(timer() * -35 + 0) * 150, cos(timer() * -45 + 0) * 150;
            clip_poly__add_ sin(timer() * 50 + 10) * 150, cos(timer() * -30 + 80) * 150;
            clip_poly__add_ cos(timer() * 65 + 200) * 150, sin(timer() * 32 + 150) * 150;
        }
    }
    else {
        demo__i = 5;
        repeat (pts.length - 4) / 2 {
            clip_poly__add_ pts[demo__i], pts[demo__i + 1];
            demo__i += 2;
        }
    }
}

proc demo__draw_clip_shape {
    setpensize 1;
    ctc__i = 1;
    setpencolor "#ff5252";
    goto clip__clip_poly[1], clip__clip_poly[2];
    penup;
    pendown;
    ctc__i += 2;
    repeat clip__clip_poly.length / 2 - 1 {
        goto clip__clip_poly[ctc__i], clip__clip_poly[ctc__i + 1];
        ctc__i += 2;
        changepenhue 10;
    }
    goto clip__clip_poly[1], clip__clip_poly[2];
    penup;
}

proc zz__inner_circlengon__circleline_intersect_ x1, y1, x2, y2, x, y, r {
    if $x1 = $x2 {
        ctc__m = sqrt($r * $r - ($x1 - $x) * ($x1 - $x)) * (($y1 > $y2) * 2 - 1);
        if ctc__m != 0 {
            ctc__y = ctc__m + $y;
            if (ctc__y - $y1) * (ctc__y - $y2) <= 0 {
                clip__buffer1.add $x1;
                clip__buffer1.add ctc__y;
                clip__buffer2.add $x1;
                clip__buffer2.add ctc__y;
            }
            ctc__y = $y - ctc__m;
            if (ctc__y - $y1) * (ctc__y - $y2) <= 0 {
                clip__buffer1.add $x1;
                clip__buffer1.add ctc__y;
                clip__buffer2.add $x1;
                clip__buffer2.add ctc__y;
            }
        }
    }
    else {
        ctc__m = ($y2 - $y1) / ($x2 - $x1);
        ctc__intercept = $y1 - $y - ctc__m * ($x1 - $x);
        ctc__a = ctc__m * ctc__m + 1;
        ctc__b = 2 * (ctc__intercept * ctc__m);
        ctc__c = ctc__intercept * ctc__intercept - $r * $r;
        ctc__t = ctc__b * ctc__b - 4 * (ctc__a * ctc__c);
        if ctc__t < 0 {
            return;
        }
        ctc__c = ($x1 < $x2) * 2 - 1;
        ctc__t = sqrt(ctc__t) * ctc__c;
        ctc__x = (ctc__b + ctc__t) / (-2 * ctc__a);
        if (ctc__x + $x - $x2) * ctc__c <= 0 and (ctc__x + $x - $x1) * ctc__c >= 0 {
            clip__buffer1.add ctc__x + $x;
            clip__buffer1.add ctc__m * ctc__x + ctc__intercept + $y;
            clip__buffer2.add ctc__x + $x;
            clip__buffer2.add ctc__m * ctc__x + ctc__intercept + $y;
        }
        ctc__x = (ctc__t - ctc__b) / (2 * ctc__a);
        if not ((ctc__x + $x - $x2) * ctc__c > 0 or (ctc__x + $x - $x1) * ctc__c < 0) {
            clip__buffer1.add ctc__x + $x;
            clip__buffer1.add ctc__m * ctc__x + ctc__intercept + $y;
            clip__buffer2.add ctc__x + $x;
            clip__buffer2.add ctc__m * ctc__x + ctc__intercept + $y;
        }
    }
}

proc zz__inner_circlengon__get_current dx, dy, r {
    current = $dx * $dx + $dy * $dy < $r * $r;
}

proc ctc__circle_check x, y, r {
    ctc__i = 1;
    ctc__j = clip__clip_poly.length - 1;
    repeat clip__clip_poly.length / 2 {
        ctc__normal_x = (clip__clip_poly[ctc__i + 1] - clip__clip_poly[ctc__j + 1]) * ctc__flip;
        ctc__normal_y = (clip__clip_poly[ctc__j] - clip__clip_poly[ctc__i]) * ctc__flip;
        ctc__normal_v = ctc__normal_x * clip__clip_poly[ctc__i] + ctc__normal_y * clip__clip_poly[ctc__i + 1];
        if ctc__normal_x * $x + ctc__normal_y * $y - ctc__normal_v < 0 {
            clip__buffer1.add "OUT POLY";
            return;
        }
        ctc__j = ctc__i;
        ctc__i += 2;
    }
}

proc ctc__fill_circlengon_clip_ x, y, r {
    if clip__buffer1.join = "OUT POLY" {
        return;
    }
    if clip__buffer1.length = 0 {
        penup;
        goto $x, $y;
        setpensize $r * 2;
        pendown;
        penup;
        return;
    }
    ctc__i = 3;
    repeat clip__buffer1.length / 2 - 2 {
        __Azex_3D clip__buffer1[1], clip__buffer1[2], clip__buffer1[ctc__i], clip__buffer1[ctc__i + 1], clip__buffer1[ctc__i + 2], clip__buffer1[ctc__i + 3];
        ctc__i += 2;
    }
    ctc__i = 1 + 2 * (ctc__first = 0);
    repeat clip__buffer2.length / 4 - (-ctc__first) {
        zz__inner_circlengon__segment_by_coords_ clip__buffer2[ctc__i], clip__buffer2[ctc__i + 1], clip__buffer2[ctc__i + 2], clip__buffer2[ctc__i + 3], $x, $y, $r;
        ctc__i += 4;
    }
    if ctc__first = 0 {
        zz__inner_circlengon__segment_by_coords_ clip__buffer2[ctc__i], clip__buffer2[ctc__i + 1], clip__buffer2[1], clip__buffer2[2], $x, $y, $r;
    }
}

proc __Azex_3D a, b, c, d, e, f {
    _1 = sqrt(($c - $e) * ($c - $e) + ($d - $f) * ($d - $f));
    _2 = sqrt(($e - $a) * ($e - $a) + ($f - $b) * ($f - $b));
    _3 = sqrt(($c - $a) * ($c - $a) + ($d - $b) * ($d - $b));
    _4 = _1 + (_2 + _3);
    goto (_1 * $a + _2 * $c + _3 * $e) / _4, (_1 * $b + _2 * $d + _3 * $f) / _4;
    _z_Azex_Optimized_DOT_Draw x() - $a, y() - $b, x() - $c, y() - $d, x() - $e, y() - $f, sqrt((_3 + _2 - _1) * (_1 + _3 - _2) * (_4 - _3 * 2) / _4), $a, $b, $c, $d, $e, $f;
}

proc clip_poly__add_ x, y {
    clip__clip_poly.add round($x);
    clip__clip_poly.add round($y);
}

