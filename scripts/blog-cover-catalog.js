const CATALOG_VERSION = "2";
const PALETTES = [
    { id: "clay", paper: "#F7F3EB", wash: "#EEDDD0", accent: "#B77658", leaf: "#68765D", ink: "#303A33" },
    { id: "sage", paper: "#F7F3EB", wash: "#DEE5D8", accent: "#728668", leaf: "#B17B5D", ink: "#303A33" },
    { id: "lilac", paper: "#F7F3EB", wash: "#E5DFEA", accent: "#95839E", leaf: "#6B7D70", ink: "#303A33" },
    { id: "ochre", paper: "#F7F3EB", wash: "#EEE4CA", accent: "#B49455", leaf: "#6D806D", ink: "#303A33" },
    { id: "sea", paper: "#F7F3EB", wash: "#DCE8E2", accent: "#67948B", leaf: "#B48365", ink: "#303A33" },
];
// All artwork uses a 1000 × 600 stage, inside the crop-safe area of the cover.
function tools(p) {
    const r = (x, y, w, h, fill = p.paper, rx = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
    const c = (x, y, radius, fill = p.accent) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}"/>`;
    const e = (x, y, rx, ry, fill = p.wash) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
    const d = (path, fill = "none", extra = "") => `<path d="${path}" fill="${fill}" ${extra}/>`;
    const l = (x, y, xx, yy, extra = "") => `<path d="M${x} ${y}L${xx} ${yy}" fill="none" ${extra}/>`;
    const g = (x, y, scale, body) => `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
    const leaf = (x, y, scale = 1) => g(x, y, scale, d("M0 0C-65-75-70-140-20-166C45-130 35-55 0 0Z", p.leaf) + d("M0 0C70-15 110-64 88-102C30-105-2-56 0 0Z", p.accent) + l(0, 10, -14, -130));
    const pot = (x, y, scale = 1) => g(x, y, scale, leaf(0, 0, .75) + d("M-52 0H52L38 91H-38Z", p.paper) + l(-58, 0, 58, 0));
    const tree = (x, y, scale = 1) => g(x, y, scale, c(0, -105, 70, p.leaf) + c(-45, -65, 53, p.leaf) + c(43, -60, 55, p.leaf) + l(0, -110, 0, 80) + l(0, -10, -32, -43) + l(0, 9, 33, -20));
    const cup = (x, y, scale = 1) => g(x, y, scale, d("M-53-43H51V12Q51 58 0 58Q-53 58-53 12Z", p.paper) + d("M51-27H65Q110-27 100 5Q94 30 51 26") + e(0, -43, 52, 11, p.accent) + e(4, 67, 77, 9, p.paper));
    const book = (x, y, scale = 1) => g(x, y, scale, d("M0-30Q-70-75-140-42V90Q-65 65 0 110Q65 65 140 90V-42Q70-75 0-30Z", p.paper) + l(0, -28, 0, 110) + d("M-111-5Q-70-14-28 6M-111 24Q-70 15-28 35M28 6Q70-14 111-5M28 35Q70 15 111 24"));
    const books = (x, y, scale = 1) => g(x, y, scale, r(0, -115, 30, 115, p.accent, 2) + r(34, -140, 26, 140, p.paper, 2) + r(67, -101, 37, 101, p.leaf, 2) + d("M112-120L143-127L171-7L140 0Z", p.paper) + l(-10, 5, 181, 5));
    const chair = (x, y, scale = 1) => g(x, y, scale, r(-53, -125, 106, 105, p.accent, 22) + r(-65, -25, 130, 28, p.paper, 8) + l(-45, 3, -56, 100) + l(45, 3, 56, 100));
    const table = (x, y, w = 360) => r(x, y, w, 23, p.paper, 7) + l(x + 30, y + 25, x + 20, y + 160) + l(x + w - 30, y + 25, x + w - 20, y + 160);
    const frame = (x, y, w = 200, h = 210) => r(x, y, w, h, p.paper, 3) + r(x + 18, y + 18, w - 36, h - 36, p.wash, 1) + c(x + w * .67, y + h * .32, w * .1, p.accent) + d(`M${x + 19} ${y + h - 20}L${x + w * .43} ${y + h * .4}L${x + w * .66} ${y + h * .7}L${x + w - 19} ${y + h * .5}V${y + h - 19}Z`, p.leaf);
    const window = (x, y, w = 350, h = 300) => r(x, y, w, h, p.paper, 40) + r(x + 15, y + 15, w - 30, h - 30, p.wash, 28) + l(x + w / 2, y + 15, x + w / 2, y + h - 15) + l(x + 15, y + h * .55, x + w - 15, y + h * .55);
    const bench = (x, y, scale = 1) => g(x, y, scale, r(0, -60, 250, 24, p.leaf, 3) + r(0, -27, 250, 25, p.paper, 3) + l(23, -2, 13, 75) + l(225, -2, 237, 75) + l(30, -60, 30, -27) + l(220, -60, 220, -27));
    const skyline = (x, y, scale = 1) => g(x, y, scale, r(0, -120, 78, 120, p.leaf, 2) + r(90, -200, 96, 200, p.paper, 2) + r(200, -95, 73, 95, p.accent, 2) + r(286, -155, 90, 155, p.paper, 2) + l(110, -165, 165, -165) + l(110, -130, 165, -130) + l(110, -95, 165, -95));
    const tower = (x, y, scale = 1) => g(x, y, scale, d("M-28 0L-12-235H12L28 0Z", p.paper) + r(-46, -268, 92, 35, p.accent, 8) + l(0, -268, 0, -356) + l(-20, -313, 20, -313));
    const bike = (x, y, scale = 1) => g(x, y, scale, c(0, 0, 68, p.paper) + c(238, 0, 68, p.paper) + d("M0 0L75-126L137 0H0L100-82H207L238 0M207-82L193-147H228M75-126L58-153M41-153H90") + c(137, 0, 9, p.accent));
    const bowl = (x, y, scale = 1) => g(x, y, scale, d("M-110-25H110Q95 89 0 89Q-95 89-110-25Z", p.paper) + e(0, -25, 110, 21, p.accent) + d("M-25-70Q-43-92-24-116M15-70Q-3-92 16-116"));
    const dog = (x, y, scale = 1) => g(x, y, scale, d("M-80-90Q-120-160-144-120Q-155-84-106-58M-80-90H20L60-160L92-110L137-90V-52L76-40L58 24H-51L-75-25Z", p.paper) + l(-51, 24, -60, 80) + l(40, 24, 52, 80) + c(92, -95, 5, p.ink));
    const person = (x, y, scale = 1) => g(x, y, scale, c(0, -170, 27, p.paper) + d("M-32-130Q0-145 32-130L48-30H-48Z", p.accent) + d("M-25-28L-40 70M25-28L40 70M-30-115L-68-53M30-115L68-53"));
    const camera = (x, y, scale = 1) => g(x, y, scale, r(-135, -85, 270, 160, p.paper, 22) + r(-77, -114, 95, 30, p.accent, 5) + c(10, -7, 65, p.ink) + c(10, -7, 43, p.accent) + c(10, -7, 23, p.paper) + r(82, -66, 32, 22, p.leaf, 4));
    const hanok = (x, y, scale = 1) => g(x, y, scale, d("M-130-100Q-80-100 0-160Q80-100 130-100L107-65H-107Z", p.ink) + r(-100, -65, 200, 150, p.paper, 2) + r(-59, -37, 118, 122, p.leaf, 1) + l(0, -37, 0, 85) + l(-59, 4, 59, 4) + l(-78, -65, -78, 85) + l(78, -65, 78, 85));
    return { r, c, e, d, l, g, leaf, pot, tree, cup, book, books, chair, table, frame, window, bench, skyline, tower, bike, bowl, dog, person, camera, hanok };
}
// Each entry has its own subjects, activity and composition, rather than a recolor.
const SUBJECTS = {
    music: { label: "음악·LP", scenes: [
            ["turntable-room", "턴테이블과 레코드가 있는 청음 공간", (t, p) => t.window(570, 30, 310, 340) + t.table(150, 390, 520) + t.r(195, 245, 390, 139, p.paper, 18) + t.e(345, 310, 103, 55, p.ink) + t.e(345, 310, 29, 16, p.accent) + t.d("M521 273V331L474 355") + t.r(68, 225, 66, 165, p.leaf) + t.c(101, 332, 22, p.paper) + t.pot(816, 415, .8)],
            ["record-shelves", "레코드 진열장과 감상용 헤드폰", (t, p) => t.r(180, 80, 625, 400, p.paper, 12) + [110, 290].map(y => t.r(207, y, 570, 150, p.wash, 1) + [237, 412, 587].map(x => t.r(x, y + 15, 135, 115, p.paper, 1) + t.c(x + 67, y + 71, 44, p.ink) + t.c(x + 67, y + 71, 12, p.accent)).join("")).join("") + t.l(158, 490, 830, 490)],
            ["listening-seat", "큰 스피커와 청음 의자가 있는 방", (t, p) => t.r(140, 112, 174, 345, p.leaf) + t.c(227, 210, 47, p.paper) + t.c(227, 365, 62, p.ink) + t.c(227, 365, 23, p.accent) + t.chair(607, 360, 1.35) + t.table(758, 337, 125) + t.cup(812, 304, .45) + t.frame(425, 58, 180, 180)],
        ] },
    book: { label: "책·도서관", scenes: [
            ["bookshop-door", "책과 차양이 있는 독립서점 입구", (t, p) => t.r(165, 110, 670, 365, p.paper, 3) + t.r(240, 202, 200, 273, p.leaf, 2) + t.window(510, 210, 245, 200) + t.d("M140 180L185 85H815L860 180Z", p.accent) + t.c(405, 345, 7, p.paper) + t.books(545, 390, 1.1) + t.pot(110, 407, .7)],
            ["library-aisle", "여러 층의 책장 사이 통로", (t, p) => [100, 630].map(x => t.r(x, 70, 270, 430, p.paper, 3) + [235, 390].map(y => t.books(x + 35, y, 1.1) + t.l(x, y + 7, x + 270, y + 7)).join("")).join("") + t.d("M410 530L460 350H540L590 530", p.wash)],
            ["reading-window", "창가 의자와 펼쳐 놓은 책", t => t.window(150, 40, 420, 335) + t.chair(733, 371, 1.1) + t.table(254, 390, 385) + t.book(445, 335, .75) + t.pot(110, 443, .6)],
        ] },
    cafe: { label: "커피·카페", scenes: [
            ["espresso-bar", "에스프레소 머신이 놓인 커피 바", (t, p) => t.table(125, 365, 740) + t.r(260, 162, 360, 195, p.accent, 20) + t.r(297, 203, 287, 82, p.paper) + t.l(367, 286, 367, 321) + t.l(509, 286, 509, 321) + t.cup(365, 343, .4) + t.cup(510, 343, .4) + t.r(720, 248, 84, 110, p.leaf) + t.c(762, 216, 45, p.paper)],
            ["pour-over", "드리퍼와 주전자가 있는 커피 작업대", (t, p) => t.table(140, 420, 720) + t.d("M245 210H450L400 330H295Z", p.accent) + t.d("M290 339H406L430 411H270Z", p.paper) + t.d("M600 265Q540 320 574 395H720Q755 320 695 265Z", p.paper) + t.d("M610 265L590 231H660L680 265M710 313L795 271L724 360M579 304Q518 266 520 336Q522 373 574 365") + t.cup(790, 380, .5)],
            ["cafe-window", "창밖 나무를 바라보는 카페 테이블", t => t.window(380, 25, 430, 330) + t.tree(700, 258, .7) + t.table(218, 380, 430) + t.chair(140, 410, .65) + t.chair(730, 410, .65) + t.cup(432, 338, .8) + t.pot(866, 410, .7)],
            ["bridge-cafe", "한강 다리가 보이는 전망 카페", (t, p) => t.r(180, 65, 640, 290, p.paper, 40) + t.r(200, 245, 600, 90, p.wash, 5) + t.d("M220 240H780M240 240Q365 105 490 240M490 240Q615 105 740 240") + t.table(225, 417, 550) + t.cup(420, 370, .8) + t.cup(645, 385, .5)],
        ] },
    tea: { label: "차·다도", scenes: [
            ["tea-set", "찻주전자와 작은 찻잔이 놓인 다도 상", (t, p) => t.r(155, 386, 690, 47, p.leaf, 15) + t.e(499, 289, 117, 88, p.paper) + t.d("M401 274L327 230L398 327M587 240Q692 222 673 295Q659 334 606 317") + t.r(451, 190, 94, 20, p.accent) + t.c(498, 176, 14, p.leaf) + [260, 715].map(x => t.cup(x, 360, .48)).join("") + t.leaf(200, 198, .45)],
            ["tea-shelves", "도자기 찻주전자와 잔의 진열장", (t, p) => t.r(185, 60, 630, 440, p.paper) + [210, 390].map(y => t.l(210, y + 55, 790, y + 55) + [285, 500, 715].map((x, i) => i === 1 ? t.e(x, y, 60, 45, p.accent) + t.r(x - 24, y - 57, 48, 15, p.paper) : t.cup(x, y, .65)).join("")).join("")],
            ["pouring-tea", "차를 따르는 주전자와 받침", (t, p) => t.table(180, 420, 640) + t.g(360, 190, .9, t.d("M-80-5Q-110 100 0 110Q100 100 80-5Z", p.accent) + t.d("M75 20L195 74L95 72M-80 10Q-180-20-143 63Q-125 96-91 72") + t.r(-56, -33, 112, 23, p.paper)) + t.d("M536 261Q620 273 649 346", "none", `stroke="${p.accent}" stroke-width="11"`) + t.cup(650, 370, .8) + t.leaf(210, 300, .55)],
        ] },
    bakery: { label: "빵·디저트", scenes: [
            ["baking-tray", "바게트와 둥근 빵이 놓인 베이킹 트레이", (t, p) => t.r(150, 170, 700, 280, p.leaf, 28) + t.g(360, 300, -.85, t.d("M-130-45Q-160 0-130 45H130Q160 0 130-45Z", p.accent) + t.d("M-85-30L-50 30M-20-30L15 30M45-30L80 30")) + t.c(680, 295, 80, p.accent) + t.d("M641 254L681 334M681 254L721 334") + t.d("M237 118Q220 89 239 60M290 118Q273 89 292 60")],
            ["bakery-case", "선반에 빵이 진열된 베이커리", (t, p) => t.r(180, 105, 640, 360, p.paper, 8) + t.r(205, 130, 590, 205, p.wash, 2) + [280, 480, 680].map(x => t.e(x, 253, 67, 45, p.accent) + t.d(`M${x - 25} 225L${x + 7} 280`)).join("") + t.l(180, 350, 820, 350) + t.r(215, 380, 570, 45, p.leaf, 2)],
            ["dessert-plate", "접시 위의 케이크와 디저트 포크", (t, p) => t.e(490, 380, 260, 62, p.paper) + t.d("M340 335V190L594 245V390Z", p.accent) + t.d("M340 190L471 123L594 245Z", p.paper) + t.d("M342 263L591 316M342 300L591 353") + t.c(474, 150, 20, p.leaf) + t.d("M780 206V413M748 173V238Q780 269 811 238V173M779 173V238")],
        ] },
    food: { label: "음식·미식", scenes: [
            ["korean-table", "밥과 여러 반찬이 있는 한식 상차림", (t, p) => t.r(120, 195, 760, 255, p.leaf, 50) + t.bowl(500, 280, .9) + [250, 750].map(x => t.e(x, 280, 76, 40, p.paper) + t.e(x, 280, 45, 20, p.accent)).join("") + t.d("M315 195L347 121M340 203L374 121")],
            ["brunch-table", "브런치 접시와 커피가 있는 식탁", (t, p) => t.e(450, 330, 245, 112, p.paper) + t.r(315, 250, 170, 110, p.accent, 28) + t.e(500, 303, 72, 49, p.paper) + t.c(500, 303, 27, p.accent) + t.leaf(599, 351, .35) + t.cup(800, 220, .7) + t.l(157, 226, 157, 409)],
            ["open-kitchen", "냄비와 조리 도구가 있는 주방", (t, p) => t.table(160, 370, 680) + t.r(330, 240, 294, 126, p.accent, 20) + t.e(477, 240, 147, 24, p.paper) + t.l(306, 268, 330, 268) + t.l(624, 268, 653, 268) + t.d("M420 199Q400 160 421 123M482 199Q462 160 483 123M544 199Q524 160 545 123") + t.r(734, 199, 47, 166, p.leaf) + t.l(215, 122, 215, 307) + t.e(215, 112, 28, 39, p.paper)],
        ] },
    market: { label: "시장·식료품", scenes: [
            ["market-stall", "차양 아래 과일을 진열한 시장 좌판", (t, p) => t.d("M130 205L193 100H805L870 205Z", p.accent) + t.r(170, 320, 660, 145, p.paper, 4) + [250, 410, 570, 730].map(x => t.r(x - 61, 276, 122, 76, p.leaf, 4) + [x - 29, x + 25].map(xx => t.c(xx, 286, 27, p.accent)).join("")).join("") + t.l(170, 205, 170, 320) + t.l(830, 205, 830, 320)],
            ["grocery-shelf", "병과 식료품을 담은 마켓 선반", (t, p) => t.r(180, 72, 640, 430, p.paper) + [240, 430].map(y => t.l(200, y, 800, y) + [270, 430, 590, 750].map((x, i) => t.r(x - 35, y - 108, 70, 105, i % 2 ? p.accent : p.leaf, 8) + t.r(x - 24, y - 140, 48, 30, p.paper, 4) + t.r(x - 22, y - 75, 44, 45, p.paper, 2)).join("")).join("")],
            ["alley-stores", "작은 점포와 장바구니가 있는 시장 골목", (t, p) => t.r(130, 130, 260, 330, p.paper, 2) + t.r(610, 80, 260, 380, p.paper, 2) + t.d("M110 210L145 120H375L410 210Z", p.accent) + t.d("M590 180L625 72H855L890 180Z", p.leaf) + t.r(180, 245, 155, 180, p.wash, 2) + t.r(665, 220, 150, 205, p.wash, 2) + t.d("M430 390H566L551 490H445Z", p.accent) + t.d("M455 390V361Q500 312 545 361V390")],
        ] },
    shop: { label: "편집숍·빈티지·문구", scenes: [
            ["museum-goods", "도자기와 미술 굿즈를 놓은 진열대", (t, p) => t.frame(145, 65, 230, 225) + t.r(270, 360, 545, 110, p.paper, 3) + t.bowl(429, 295, .6) + t.r(585, 205, 112, 150, p.accent, 3) + t.d("M605 205V178Q640 128 677 178V205") + t.books(185, 466, .72) + t.r(750, 233, 100, 128, p.leaf, 3)],
            ["vintage-rail", "옷걸이와 빈티지 의류가 있는 행거", (t, p) => t.d("M170 500V110H830V500M125 500H215M785 500H875") + [300, 500, 700].map((x, i) => t.d(`M${x} 135V161L${x - 69} 200H${x + 69}L${x} 161`) + t.d(`M${x - 52} 206L${x - 99} 259L${x - 61} 291L${x - 45} 268V407H${x + 45}V268L${x + 61} 291L${x + 99} 259L${x + 52} 206Q${x} 237 ${x - 52} 206Z`, i === 1 ? p.leaf : p.paper)).join("")],
            ["designer-shelf", "문구와 디자인 소품을 전시한 선반", (t, p) => t.r(160, 80, 680, 410, p.paper, 3) + t.l(180, 280, 820, 280) + t.frame(215, 111, 160, 140) + t.c(527, 207, 50, p.accent) + t.r(661, 135, 95, 119, p.leaf, 5) + t.books(241, 452, 1) + t.r(535, 365, 105, 86, p.wash) + t.d("M549 365L537 315M581 365L600 312M614 365L640 329") + t.bowl(733, 403, .42)],
            ["stationery-desk", "노트와 만년필을 고르는 문구 진열대", (t, p) => t.r(170, 115, 660, 360, p.paper, 20) + t.r(235, 175, 230, 245, p.accent, 6) + t.l(275, 175, 275, 420) + t.r(560, 215, 44, 201, p.leaf, 6) + t.d("M560 215L582 143L604 215Z", p.paper) + t.r(670, 290, 92, 123, p.wash, 6) + t.d("M682 290L668 183M712 290L731 177M743 290L768 212")],
            ["furniture-showroom", "스탠드 조명과 빈티지 가구 쇼룸", (t, p) => t.chair(355, 339, 1.4) + t.table(555, 344, 250) + t.d("M770 344V129M685 129H855L812 55H728Z", p.accent) + t.frame(150, 60, 180, 180)],
            ["perfume-display", "유리 향수병과 인센스가 있는 쇼룸", (t, p) => t.r(180, 395, 640, 74, p.paper, 12) + [320, 540, 720].map((x, i) => t.r(x - 50, 225 + i * 23, 100, 160 - i * 23, i % 2 ? p.leaf : p.accent, 14) + t.r(x - 28, 185 + i * 23, 56, 40, p.paper, 4) + t.r(x - 28, 285 + i * 17, 56, 42, p.paper, 2)).join("") + t.d("M171 325L132 211M131 191Q109 161 130 139")],
            ["refill-shop", "리필 병과 재사용 용기를 놓은 제로웨이스트 숍", (t, p) => t.r(140, 380, 720, 100, p.paper, 8) + [285, 500, 715].map(x => t.r(x - 53, 140, 106, 235, p.wash, 9) + t.r(x - 35, 117, 70, 24, p.leaf, 4) + t.d(`M${x} 142V100H${x + 52}`) + t.r(x - 35, 233, 70, 64, p.accent, 3)).join("")],
            ["toy-shelf", "피규어와 장난감을 모아 둔 수집품 선반", (t, p) => t.r(150, 150, 700, 330, p.paper, 8) + t.r(210, 245, 150, 155, p.leaf, 15) + t.r(225, 195, 120, 65, p.accent, 10) + t.c(253, 224, 7, p.paper) + t.c(312, 224, 7, p.paper) + t.r(450, 220, 130, 178, p.accent, 16) + t.d("M450 220L515 151L580 220Z", p.paper) + t.c(715, 297, 71, p.leaf) + t.c(670, 228, 28, p.leaf) + t.c(760, 228, 28, p.leaf) + t.c(696, 283, 5, p.paper) + t.c(738, 283, 5, p.paper)],
        ] },
    plant: { label: "식물·가드닝", scenes: [
            ["potting-bench", "여러 화분과 원예 도구가 있는 분갈이 작업대", (t, p) => t.table(150, 400, 700) + t.pot(340, 305, 1.15) + t.pot(665, 340, .65) + t.r(765, 310, 35, 82, p.leaf, 2) + t.d("M777 310V237Q805 215 833 237V265H777") + t.r(170, 315, 92, 78, p.accent, 6)],
            ["greenhouse-path", "유리 온실 안 식물과 보행 통로", (t, p) => t.d("M150 470V170L500 35L850 170V470Z", p.paper) + t.d("M500 35V255M150 170H850M325 105V470M675 105V470") + t.pot(260, 333, .8) + t.pot(733, 333, .9) + t.d("M390 510L450 315H550L610 510Z", p.wash)],
            ["plant-display", "높이가 다른 식물 판매 진열대", (t, p) => t.r(150, 397, 250, 105, p.paper, 2) + t.r(405, 323, 220, 179, p.paper, 2) + t.r(630, 424, 220, 78, p.paper, 2) + t.pot(270, 290, 1.1) + t.pot(510, 237, .85) + t.pot(740, 361, .68)],
        ] },
    forest: { label: "숲·정원·흙길", scenes: [
            ["woodland-trail", "나무 사이로 이어지는 숲 산책로", (t, p) => t.d("M100 390Q300 270 490 370Q700 260 900 390V510H100Z", p.wash) + t.tree(235, 250, 1.1) + t.tree(760, 295, .8) + t.d("M365 525Q640 416 458 350Q360 310 529 273", "none", `stroke="${p.accent}" stroke-width="68"`)],
            ["earthing-trail", "흙길과 보행 발자국이 있는 황톳길", (t, p) => t.d("M170 510Q385 410 335 285Q295 185 615 91L775 125Q480 222 523 303Q620 420 490 510Z", p.accent) + t.tree(160, 249, .82) + t.leaf(845, 430, .8) + t.e(471, 356, 12, 25, p.paper) + t.e(418, 306, 12, 25, p.paper) + t.e(460, 241, 12, 25, p.paper)],
            ["forest-picnic", "나무 그늘 아래 돗자리와 피크닉 바구니", (t, p) => t.tree(220, 190, 1.3) + t.d("M325 340L717 308L858 465L425 500Z", p.accent) + t.d("M420 335L522 489M544 325L646 478M378 397L787 371") + t.r(484, 310, 138, 85, p.paper) + t.d("M505 310V285Q550 232 598 285V310") + t.cup(717, 408, .55)],
            ["rooftop-garden", "도시 풍경 위 옥상 정원과 벤치", (t, p) => t.skyline(190, 305, 1.6) + t.r(150, 405, 700, 75, p.paper, 5) + t.tree(710, 283, .7) + t.bench(285, 371, .9) + t.d("M170 378H830")],
        ] },
    river: { label: "한강·수변", scenes: [
            ["riverside-rest", "강변 벤치와 물결이 있는 쉼터", (t, p) => t.d("M110 285Q300 237 500 285T890 285V490H110Z", p.wash) + t.d("M170 329H336M570 371H798M220 424H463") + t.bench(480, 379, 1) + t.tree(219, 194, .85) + t.c(775, 141, 48, p.accent)],
            ["river-bridge", "아치형 다리와 강 위 풍경", (t, p) => t.d("M110 317H890V501H110Z", p.wash) + t.d("M140 305H860V350H140Z", p.paper) + [250, 500, 750].map(x => t.d(`M${x - 100} 305Q${x} 95 ${x + 100} 305`)).join("") + t.d("M178 413H370M570 459H805") + t.skyline(550, 238, .6)],
            ["stream-path", "징검다리와 하천을 따라가는 보행로", (t, p) => t.d("M390 77Q265 257 615 529H823Q470 296 611 77Z", p.accent) + t.d("M154 79Q147 361 430 520", "none", `stroke="${p.leaf}" stroke-width="34"`) + [330, 430, 530].map((x, i) => t.e(x, 260 + i * 42, 42, 18, p.paper)).join("") + t.leaf(783, 203, .6)],
            ["public-fountain", "물줄기가 솟는 공원의 분수", (t, p) => t.e(500, 410, 330, 75, p.paper) + t.d("M310 400Q310 114 500 266Q690 114 690 400M500 395V96", "none", `stroke="${p.accent}" stroke-width="18"`) + t.e(500, 410, 285, 48, p.wash) + t.tree(160, 235, .55) + t.tree(840, 235, .55)],
        ] },
    citywalk: { label: "동네·골목 산책", scenes: [
            ["alley-stairs", "작은 집 사이로 이어지는 골목 계단", (t, p) => t.r(130, 140, 250, 330, p.paper, 2) + t.r(650, 85, 210, 385, p.leaf, 2) + t.r(174, 200, 100, 111, p.wash, 2) + t.r(700, 160, 100, 110, p.paper, 2) + t.d("M360 500H650V450H600V400H550V350H500V300H450V250H400", p.accent) + t.pot(190, 411, .55)],
            ["neighborhood-street", "가로등과 낮은 주택이 있는 동네 길", (t, p) => t.d("M140 485L480 220L860 485Z", p.wash) + t.r(140, 245, 210, 160, p.paper, 2) + t.d("M115 245L245 135L376 245Z", p.leaf) + t.r(660, 170, 195, 225, p.paper, 2) + t.d("M635 170L757 85L880 170Z", p.accent) + t.d("M475 340V105H544") + t.c(544, 126, 26, p.accent)],
            ["local-square", "나무와 벤치가 있는 작은 동네 광장", (t, p) => t.e(500, 423, 380, 94, p.wash) + t.tree(490, 191, 1.15) + t.bench(155, 395, .8) + t.bench(655, 395, .8) + t.d("M298 474H699M356 507H644")],
        ] },
    view: { label: "노을·야경·전망·천문", scenes: [
            ["sunset-window", "커다란 노을과 도시를 바라보는 전망창", (t, p) => t.r(140, 55, 720, 440, p.paper, 155) + t.c(500, 241, 113, p.accent) + t.skyline(203, 425, 1.5) + t.l(500, 65, 500, 478) + t.l(147, 350, 853, 350)],
            ["tower-night", "서울타워와 낮은 도심의 야경", (t, p) => t.d("M130 450Q450 180 740 450Z", p.leaf) + t.tower(457, 407, 1) + t.skyline(605, 490, .7) + t.c(760, 130, 40, p.accent) + t.d("M224 130V157M211 144H237M632 77V103M620 90H645")],
            ["observatory", "삼각대 망원경과 별을 보는 관측 공간", (t, p) => t.e(500, 455, 300, 48, p.wash) + t.g(500, 240, 1, t.d("M-140 5L120-106L152-30L-105 81Z", p.paper) + t.d("M-127 0L-94 88M110-116L158-20") + t.d("M0 45V209M0 72L-104 221M0 72L104 221")) + t.c(760, 120, 38, p.accent) + t.d("M230 134V180M208 157H252M690 62V88M677 75H703")],
        ] },
    hanok: { label: "한옥·궁궐", scenes: [
            ["hanok-courtyard", "한옥 지붕과 마당의 쉼터", (t, p) => t.hanok(500, 315, 1.75) + t.e(500, 502, 370, 24, p.wash) + t.pot(150, 420, .7) + t.d("M400 460H600M362 488H640")],
            ["wooden-veranda", "기둥 사이로 보이는 한옥 대청마루", (t, p) => t.r(150, 375, 700, 85, p.leaf, 2) + [180, 790].map(x => t.r(x, 90, 30, 285, p.accent, 2)).join("") + t.d("M140 90H860M150 460L120 500H880L850 460", p.paper) + t.l(500, 378, 500, 459) + t.window(327, 120, 350, 220) + t.cup(605, 352, .55)],
            ["palace-colonnade", "반복되는 궁궐 기둥과 회랑", (t, p) => t.d("M130 130L230 66H785L870 130Z", p.ink) + [190, 380, 570, 760].map(x => t.r(x, 132, 30, 290, p.accent, 2) + t.r(x - 20, 420, 70, 30, p.paper, 2)).join("") + t.d("M140 456H870L890 510H110Z", p.wash) + t.l(150, 176, 850, 176)],
        ] },
    architecture: { label: "건축·공공 공간", scenes: [
            ["modern-facade", "입면과 구조가 드러나는 현대 건축", (t, p) => t.r(160, 180, 440, 300, p.paper, 2) + t.r(520, 75, 300, 405, p.leaf, 2) + [240, 330, 420].map(y => t.l(180, y, 590, y)).join("") + [570, 650, 730].map(x => t.r(x, 120, 35, 270, p.wash, 2)).join("") + t.person(365, 405, .5)],
            ["public-courtyard", "건물 사이의 나무와 공개공지", (t, p) => t.r(130, 80, 180, 400, p.paper, 2) + t.r(700, 80, 170, 400, p.paper, 2) + t.r(310, 80, 390, 90, p.accent, 2) + t.tree(500, 321, .9) + t.bench(411, 445, .75) + t.d("M170 510H830")],
            ["atrium", "큰 창과 계단이 있는 실내 아트리움", (t, p) => t.r(150, 70, 700, 420, p.paper, 4) + [290, 500, 710].map(x => t.l(x, 90, x, 470)).join("") + t.l(170, 220, 830, 220) + t.d("M240 450L625 250H750L360 450Z", p.accent) + t.d("M240 420L625 220M750 220L360 420") + t.pot(763, 390, .65)],
            ["shared-workspace", "노트북과 책이 놓인 공공 작업 공간", (t, p) => t.window(530, 50, 280, 270) + t.table(150, 360, 700) + t.d("M300 350L275 206H465L490 350Z", p.leaf) + t.r(270, 350, 230, 15, p.paper, 2) + t.books(615, 352, .7) + t.chair(435, 448, .6)],
        ] },
    art: { label: "전시·갤러리", scenes: [
            ["gallery-wall", "큰 그림과 작은 작품이 걸린 전시 벽", t => t.frame(200, 90, 360, 330) + t.frame(650, 140, 170, 210) + t.bench(350, 476, 1) + t.d("M120 510H880")],
            ["sculpture-room", "전시대 위의 추상 조각", (t, p) => t.r(330, 340, 350, 160, p.paper, 2) + t.d("M389 340Q241 128 482 92Q660 69 583 254Q540 349 389 340Z", p.accent) + t.c(483, 201, 56, p.wash) + t.person(802, 405, .6) + t.d("M130 510H880")],
            ["poster-display", "포스터와 판화가 놓인 전시 공간", (t, p) => t.frame(155, 85, 220, 280) + t.frame(430, 150, 190, 245) + t.frame(675, 65, 170, 220) + t.r(250, 440, 500, 32, p.leaf, 3) + t.l(290, 472, 280, 515) + t.l(710, 472, 720, 515)],
        ] },
    museum: { label: "박물관·소장품", scenes: [
            ["theme-display", "서로 다른 소장품을 담은 박물관 진열장", (t, p) => t.r(170, 105, 660, 320, p.paper, 8) + t.r(194, 128, 612, 273, p.wash, 2) + t.bowl(335, 285, .65) + t.r(523, 225, 100, 143, p.accent, 4) + t.d("M537 225Q573 128 610 225", p.leaf) + t.l(160, 436, 840, 436) + t.l(230, 436, 210, 500) + t.l(770, 436, 790, 500)],
            ["artifact-plinth", "유물과 도자기를 놓은 전시대", (t, p) => t.r(250, 355, 270, 145, p.paper, 2) + t.r(610, 405, 170, 95, p.paper, 2) + t.d("M321 170H446L430 209Q515 267 453 347H314Q252 267 337 209Z", p.accent) + t.d("M680 299L744 350L706 403L645 350Z", p.leaf) + t.l(300, 154, 470, 154)],
            ["specimen-room", "식물 표본과 수집품이 있는 전시실", (t, p) => t.r(180, 70, 640, 390, p.paper, 4) + [260, 480, 700].map(x => t.r(x - 65, 120, 130, 225, p.wash, 2) + t.leaf(x, 310, .62)).join("") + t.r(340, 460, 320, 35, p.leaf, 3)],
        ] },
    craft: { label: "공예·체험", scenes: [
            ["pottery-wheel", "물레와 도자기가 있는 공방 작업대", (t, p) => t.table(130, 390, 740) + t.e(450, 368, 145, 30, p.leaf) + t.d("M380 230H520L502 270Q560 327 510 353H390Q340 327 398 270Z", p.paper) + t.bowl(740, 340, .55) + t.r(160, 308, 65, 78, p.accent) + t.d("M175 309L160 205M198 309L228 219")],
            ["leather-tools", "가죽 조각과 송곳이 있는 작업대", (t, p) => t.r(150, 120, 700, 370, p.paper, 25) + t.d("M260 200L490 175L570 375L335 420Z", p.accent) + t.d("M278 221L470 199L543 356L350 393Z", "none", 'stroke-dasharray="7 13"') + t.r(653, 225, 30, 163, p.leaf, 10) + t.l(668, 225, 687, 150) + t.d("M730 223V371M707 223H753")],
            ["craft-materials", "실과 공예 재료가 놓인 창작 테이블", (t, p) => t.table(140, 410, 720) + t.c(345, 300, 89, p.accent) + t.d("M292 233Q423 261 300 375M327 213Q464 287 340 388M302 347L510 388") + t.r(590, 202, 118, 204, p.paper) + t.d("M611 205L583 133M644 205L663 122M682 205L725 147")],
        ] },
    photo: { label: "사진·카메라", scenes: [
            ["film-camera", "필름 카메라와 필름 롤이 놓인 선반", (t, p) => t.table(150, 411, 700) + t.camera(430, 295, 1.3) + t.r(741, 295, 74, 108, p.accent, 13) + t.e(778, 295, 37, 12, p.paper) + t.d("M737 359H691V407H737")],
            ["photo-booth", "사진 부스와 촬영 의자", (t, p) => t.r(210, 70, 580, 430, p.paper, 15) + t.r(250, 109, 500, 350, p.wash, 5) + t.d("M555 112V459M590 112V459M625 112V459M660 112V459M695 112V459") + t.camera(388, 219, .55) + t.chair(385, 386, .55)],
            ["darkroom", "인화 사진과 필름을 확인하는 작업대", (t, p) => t.d("M160 100Q500 160 840 100") + [250, 470, 690].map(x => t.frame(x - 60, 133, 135, 160) + t.l(x, 120, x, 143)).join("") + t.table(140, 422, 720) + t.r(280, 353, 210, 62, p.leaf) + t.r(590, 353, 160, 62, p.accent)],
        ] },
    sports: { label: "러닝·자전거·운동", scenes: [
            ["running-track", "곡선 트랙과 운동하는 사람이 있는 러닝 코스", (t, p) => t.e(500, 350, 350, 157, p.accent) + t.e(500, 350, 273, 104, p.paper) + t.e(500, 350, 310, 130, "none") + t.person(315, 275, .8) + t.d("M450 201V245M700 407L741 444")],
            ["river-cycle", "강변에 세워 둔 자전거와 나무", (t, p) => t.d("M100 260H900V440H100Z", p.wash) + t.d("M137 300H334M660 344H859") + t.bike(334, 420, 1.25) + t.tree(150, 209, .7) + t.c(780, 127, 45, p.accent)],
            ["indoor-sport", "클라이밍 홀드와 실내 운동 매트", (t, p) => t.r(190, 70, 620, 360, p.paper, 15) + [[260, 150], [435, 115], [600, 187], [725, 115], [350, 285], [610, 330]].map(([x, y], i) => t.d(`M${x} ${y}l32-16 24 28-37 20Z`, i % 2 ? p.leaf : p.accent)).join("") + t.r(150, 430, 700, 74, p.wash, 16)],
            ["skating-rink", "아이스링크와 스케이트 부츠", (t, p) => t.e(500, 390, 370, 118, p.wash) + t.d("M295 160H445V295L534 337Q564 381 510 391H295Z", p.paper) + t.d("M306 402V431H526M306 441H560M328 211H426M328 241H426M328 271H426") + t.d("M660 282H751V363L806 392H660Z", p.accent)],
        ] },
    pet: { label: "반려동물", scenes: [
            ["dog-walk", "나무 옆에서 산책하는 사람과 반려견", t => t.tree(190, 225, .8) + t.person(520, 379, 1) + t.d("M587 326Q650 279 707 333") + t.dog(740, 416, .7) + t.d("M130 510H885")],
            ["dog-playground", "반려견과 놀이 터널이 있는 공원", (t, p) => t.d("M130 470V280Q130 95 333 95Q535 95 535 280V470Z", p.leaf) + t.d("M201 470V280Q201 169 333 169Q464 169 464 280V470Z", p.wash) + t.dog(688, 374, .95) + t.c(810, 449, 35, p.accent)],
            ["pet-rest", "반려견과 벤치가 있는 동반 휴식 공간", t => t.bench(210, 350, 1.7) + t.dog(760, 418, .8) + t.pot(150, 389, .7) + t.bowl(665, 467, .3)],
        ] },
    family: { label: "아이·가족 체험", scenes: [
            ["activity-table", "만들기 도구가 놓인 가족 체험 테이블", (t, p) => t.table(170, 365, 660) + t.chair(125, 417, .63) + t.chair(875, 417, .63) + t.r(340, 239, 150, 120, p.accent) + t.d("M340 239L415 171L490 239Z", p.leaf) + t.r(575, 280, 97, 79, p.paper) + t.r(683, 310, 65, 49, p.accent)],
            ["indoor-play", "미끄럼틀과 블록이 있는 실내 놀이 공간", (t, p) => t.r(180, 170, 150, 240, p.leaf) + t.d("M330 209Q530 450 720 450V495Q504 505 282 252Z", p.accent) + t.d("M180 220H330M180 280H330M180 340H330") + t.r(756, 344, 100, 110, p.paper) + t.c(806, 305, 44, p.accent)],
            ["outing-bag", "나들이 가방과 모자·물병", (t, p) => t.r(230, 180, 330, 275, p.accent, 55) + t.d("M290 180V146Q395 49 500 146V180") + t.r(290, 326, 210, 95, p.paper, 20) + t.r(660, 228, 90, 219, p.leaf, 18) + t.r(676, 197, 58, 30, p.paper) + t.e(777, 160, 115, 28, p.paper) + t.d("M705 159Q710 62 778 62Q846 62 850 159Z", p.paper)],
        ] },
    wellness: { label: "휴식·족욕·스파", scenes: [
            ["foot-bath", "벤치와 따뜻한 물이 있는 족욕 공간", (t, p) => t.bench(245, 265, 1.8) + t.r(230, 351, 590, 135, p.paper, 40) + t.e(525, 351, 295, 40, p.accent) + t.d("M400 300Q380 270 401 239M500 300Q480 270 501 239M600 300Q580 270 601 239") + t.pot(140, 383, .65)],
            ["spa-room", "수건과 돌이 놓인 조용한 스파", (t, p) => t.r(150, 370, 700, 110, p.leaf, 18) + t.r(230, 259, 325, 109, p.paper, 30) + t.r(250, 216, 285, 42, p.wash, 15) + t.e(715, 340, 70, 29, p.accent) + t.e(715, 294, 56, 25, p.paper) + t.e(715, 254, 40, 19, p.accent) + t.leaf(792, 183, .55)],
            ["quiet-seat", "등과 식물이 있는 조용한 휴식 의자", (t, p) => t.chair(485, 347, 1.5) + t.d("M750 436V137M681 137H819L789 65H711Z", p.accent) + t.pot(180, 407, .9) + t.e(490, 510, 255, 22, p.wash)],
        ] },
    cinema: { label: "영화·공연·레트로 놀이", scenes: [
            ["cinema-seats", "스크린과 좌석이 있는 작은 영화관", (t, p) => t.r(200, 55, 600, 270, p.paper, 4) + t.r(230, 82, 540, 215, p.leaf, 1) + [290, 500, 710].map(x => t.chair(x, 425, .9)).join("") + t.d("M460 150L550 193L460 236Z", p.wash)],
            ["small-stage", "마이크와 커튼이 있는 작은 공연 무대", (t, p) => t.r(160, 80, 680, 380, p.paper, 4) + t.d("M160 80H300L250 380H160ZM700 80H840V380H750Z", p.accent) + t.d("M500 205V435M445 435H555") + t.r(478, 140, 44, 96, p.leaf, 20) + t.r(140, 460, 720, 42, p.leaf, 2)],
            ["arcade-room", "게임기와 스툴이 있는 레트로 오락 공간", (t, p) => t.d("M260 83H610L660 178L604 326V490H255V305L220 170Z", p.accent) + t.r(282, 125, 283, 140, p.ink, 10) + t.d("M310 302H575L620 357H265Z", p.paper) + t.c(506, 331, 12, p.leaf) + t.l(355, 327, 355, 290) + t.c(355, 281, 15, p.ink) + t.chair(765, 413, .65)],
        ] },
    neutral: { label: "서울 공공 공간", scenes: [
            ["public-lounge", "창과 벤치가 있는 공공 휴식 공간", (t, p) => t.window(215, 50, 570, 335) + t.bench(325, 426, 1.4) + t.pot(159, 410, .8) + t.e(620, 515, 230, 14, p.wash)],
            ["city-courtyard", "도심의 작은 나무와 공공 광장", (t, p) => t.skyline(180, 340, 1.5) + t.e(500, 460, 360, 55, p.wash) + t.tree(520, 328, .8)],
            ["open-pavilion", "누구나 쉬어갈 수 있는 열린 정자", (t, p) => t.d("M130 190L500 60L870 190Z", p.leaf) + t.l(200, 190, 200, 450) + t.l(800, 190, 800, 450) + t.bench(340, 415, 1.3) + t.r(150, 480, 700, 28, p.paper, 4)],
        ] },
};
function getScene(subjectId, sceneId) {
    const subject = Object.hasOwn(SUBJECTS, subjectId) ? SUBJECTS[subjectId] : null;
    const scene = subject?.scenes.find(([id]) => id === sceneId);
    if (!scene)
        throw new Error("알 수 없는 표지 장면입니다.");
    return { id: scene[0], description: scene[1], draw: scene[2], label: subject.label };
}
function renderScene(design) {
    const palette = PALETTES.find(p => p.id === design.paletteId);
    if (!palette)
        throw new Error("알 수 없는 표지 배색입니다.");
    const scene = getScene(design.subjectId, design.sceneId);
    const markup = scene.draw(tools(palette), palette);
    return { palette, scene, markup: `<g transform="translate(280 130) scale(1.04)" stroke="${palette.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${markup}</g>` };
}
module.exports = { CATALOG_VERSION, PALETTES, SUBJECTS, getScene, renderScene };
