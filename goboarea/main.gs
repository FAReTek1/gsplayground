%include std\\pointengine.gs
%include std\\bezier.gs
%include std\\spritecontrol.gs
%include std\\color.gs
%include std\\lazycode.gs

costumes "blank.svg", "circle.svg";

onflag {
    hide;
    delete pts;

    reset_pes;
    pointengine_settings.add_key = "space";
    pointengine_settings.remove_key = "x";

    repeat 4 {
        add PE_Pt{x: random(-200, 200), y: random(-150, 150), col: "#FF0000"} to pts;
    }

    forever {
        tick;
        WAIT_FOR_KPRESS_RELEASE("space");
    }
}

proc tick{
        erase_all;

        size_hack "Infinity";

        cHSVA hsv = cHSVA{
            h: random(0, 100),
            s: random(0, 100),
            v: random(0, 100),
            a: random(0, 100)
        };
        cCBGBG c = HSVA_to_CBGBG(hsv);

        switch_costume "circle";
        position -100, 0, 200, 90;
        CBGBG_stamp c;

        position 100, 0, 200, 90;
        set_pen_size 200;
        pen_down;
        pen_up;
}
