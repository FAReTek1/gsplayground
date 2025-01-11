costumes "blank.svg";

%include std\\shapefill.gs

onflag {
    hide;
    forever {
        erase_all;
        fill_arc mouse_pos(), (90 * timer())  % 360, 0.75;
    }
}
