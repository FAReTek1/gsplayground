costumes "blank.svg";

%include std\\shapefill.gs

onflag {
    forever{
        erase_all;
        draw_AW pos{
            x: 0,
            y: 0,
            s: 150,
            d: 0
        }, mouse_y() / 150;
    }
}
