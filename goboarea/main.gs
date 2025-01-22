%include std\\time.gs

costumes "blank.svg", "circle.svg";

onflag {
    say AREA_BY_TZ(time_zone());
}
