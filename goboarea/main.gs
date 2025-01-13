%include std\\color.gs
%include std\\lazycode.gs

costumes "blank.svg", "circle.svg";

onflag {
    hide;
    forever {
        erase_all;
        cRGBA col = cRGBA{
            r: random(0, 255),
            g: random(0, 255),
            b: random(0, 255),
            a: random(0, 255),
        };

        set_pen_size 200;
        pen_up;

        set_pen_color RGBA(col.r, col.g, col.b, col.a);
        goto 100, 0;
        pen_down; pen_up;

        goto -100, 0;

        switch_costume "circle";
        set_size 200;
        CBGBG_stamp(RGBA_to_CBGBG(col));

        WAIT_FOR_KPRESS_RELEASE("space");
    }
}