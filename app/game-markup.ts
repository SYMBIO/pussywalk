// Static markup of the original single-page game (src/index.html, PussyWalk 2.0).
// It is driven imperatively by jQuery in `game/main.js`, so React renders it
// once as raw HTML and never touches it again.
export const gameMarkup = `		<div class="layer layer--loading is-visible">
			<div class="layer__content">
				<div class="layer__center">
					<img class="loading__logo" src="/images/layout/logo-pussywalk-2-pink.png" alt="PUSSYWALK 2">
					<div class="loading__loader"><div class="loader__bar"></div></div>
					<p class="loading__info"><span>Jeho voliči</span> <span>k urně dojdou.</span> <span>...</span></p>
					<p class="loading__q">Co ty?</p>
				</div>
			</div>
		</div>
		<h1 class="logo">PUSSYWALK 2</h1>
		<div id="time" class="time-counter"></div>
		<div id="game_controls">
			<button class="game__key game__key--left"><span></span></button>
			<button class="game__key game__key--right"><span></span></button>
		</div>
		<div id="game_lives">
			<span class="game__live game__live--old"></span>
			<span class="game__live game__live--new"></span>
		</div>
		<div class="layer layer--mission layer--mission-1">
			<div class="layer__content">
				<p><strong>MISE 1</strong> Vyzvedni Čtveráčka</p>
			</div>
		</div>
		<div class="layer layer--mission layer--mission-2">
			<div class="layer__content">
				<p><strong>MISE 2</strong> Dovrávorej k urně</p>
			</div>
		</div>
		<a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpussywalk.com" target="_blank" class="nav-share js-share"><em>share</em> <span></span></a>
		<div class="tutorial-new">
			<div class="tutorial-new__desktop">
				<img src="/images/layout/tutorial-circle.png" alt="" class="tutorial-new__circle tutorial-new__circle--1">
				<img src="/images/layout/tutorial-circle.png" alt="" class="tutorial-new__circle tutorial-new__circle--2">
				<img src="/images/layout/tutorial-bg.png" alt="" class="tutorial-new__bg">
				<div class="tutorial-new__desktop__content">
					<img src="/images/layout/tutorial-desktop-arrow.png" alt="" class="tutorial-new__desktop__arrow tutorial-new__desktop__arrow--top">
					<img src="/images/layout/tutorial-desktop-arrow.png" alt="" class="tutorial-new__desktop__arrow tutorial-new__desktop__arrow--down">
					<img src="/images/layout/tutorial-desktop-arrow.png" alt="" class="tutorial-new__desktop__arrow tutorial-new__desktop__arrow--left">
					<img src="/images/layout/tutorial-desktop-arrow.png" alt="" class="tutorial-new__desktop__arrow tutorial-new__desktop__arrow--right">
					<img src="/images/layout/tutorial-finger.png" alt="" class="tutorial-new__finger tutorial-new__finger--left">
					<img src="/images/layout/tutorial-finger.png" alt="" class="tutorial-new__finger tutorial-new__finger--right">
					<img src="/images/layout/tutorial-leg.png" alt="" class="tutorial-new__leg tutorial-new__leg--left">
					<img src="/images/layout/tutorial-leg.png" alt="" class="tutorial-new__leg tutorial-new__leg--right">
				</div>
			</div>
			<div class="tutorial-new__mobile">
				<img src="/images/layout/tutorial-circle.png" alt="" class="tutorial-new__circle tutorial-new__circle--1">
				<img src="/images/layout/tutorial-circle.png" alt="" class="tutorial-new__circle tutorial-new__circle--2">
				<img src="/images/layout/tutorial-bg.png" alt="" class="tutorial-new__bg">
				<div class="tutorial-new__mobile__content">
					<img src="/images/layout/tutorial-mobile-button-l.png" alt="" class="tutorial-new__mobile__button tutorial-new__mobile__button--left">
					<img src="/images/layout/tutorial-mobile-button-r.png" alt="" class="tutorial-new__mobile__button tutorial-new__mobile__button--right">
					<img src="/images/layout/tutorial-finger.png" alt="" class="tutorial-new__finger tutorial-new__finger--left">
					<img src="/images/layout/tutorial-finger.png" alt="" class="tutorial-new__finger tutorial-new__finger--right">
					<img src="/images/layout/tutorial-leg.png" alt="" class="tutorial-new__leg tutorial-new__leg--left">
					<img src="/images/layout/tutorial-leg.png" alt="" class="tutorial-new__leg tutorial-new__leg--right">
				</div>
			</div>
		</div>
		<div class="layer layer--finish">
			<div class="layer__content">
				<div id="name_dialogue" class="layer__center">
					<p class="finish__time">
						<strong>Gratulujeme</strong> došel jsi <span class="finish__naked">nahý</span> k urně!
						<span class="finish__time-span">v čase <span id="finish_time"></span></span>
					</p>
					<div class="finish__form">
						<label for="name_input">Krokem vratkým, ale přece se pan&nbsp;Z. k&nbsp;urně dostal! I&nbsp;když k&nbsp;trochu jiné. <span class="online">Za&nbsp;odměnu připoj své jméno k&nbsp;vítězům.</span> A&nbsp;nezapomeň přijít k urně volební!</label>
						<div class="offline">
							<p>Vypadá to, že jsi bez netu!</p>
							<p><a href="" class="btn js-play-again">Hraj znovu</a></p>
						</div>
						<span class="online">
							<input id="name_input" maxlength="20" type="text">
							<button id="send_name" class="btn">Pokračuj ></button>
						</span>
					</div>
				</div>
			</div>
		</div>
		<div class="layer layer--merch">
			<div class="layer__content">
				<div class="layer__center">
					<button class="layer__close"></button>
					<img src="/images/layout/merch.png" alt="">
					<p><strong>Kup si něco na sebe, ať ti to u voleb sluší!</strong> Udělej si radost tričkem nebo mikinou PussyWalk. Pomůžeš nám k&nbsp;výrobě dalších prkotin s&nbsp;motivy ze hry. <strong>A&nbsp;hlavně spácháš dobro</strong> – z&nbsp;výtěžku z&nbsp;prodeje podpoříme neziskovku pečující o&nbsp;staré a&nbsp;umírající lidi.</p>
					<p><a href="http://www.merchmaster.cz/pussywalk/" rel="noopener" class="btn btn--big js-merch" target="_blank">Objednat</a></p>
				</div>
			</div>
		</div>
		<div class="popup-merch">
			<span class="popup__close"></span>
			<p>
				<span>Kup si tričko <strong>PussyWalk</strong></span> a&nbsp;podpoř tak péči o <strong>umírající</strong>.
			</p>
		</div>
		<div class="layer layer--credits">
			<div class="layer__content">
				<div class="layer__center">
					<button class="layer__close"></button>
					<h3>Pachatelé</h3>
					<div id="credits">
						<p>PussyWalk je satirická hra, která vznikla z&nbsp;naší svobodné vůle, na naše vlastní náklady a&nbsp;není propojena s&nbsp;žádným politickým ani jiným subjektem.</p>
						<p>Přejeme ti zábavnou cestu k&nbsp;urně a&nbsp;důstojnou volbu prezidenta ČR v&nbsp;roce 2018.</p>
						<ul>
							<li>
								<img src="/images/layout/vasek.png" alt="">
								<div>
									<strong>Václav Krbůšek</strong>
									Ilustrace, grafika, zvuk, autor námětu.
								</div>
							</li>
							<li>
								<img src="/images/layout/zoltan.png" alt="">
								<div>
									<strong>Páll Zoltán</strong>
									Hlavní programátor hry.
								</div>
							</li>
							<li>
								<img src="/images/layout/jirka.png" alt="">
								<div>
									<strong>Jiří Váňa</strong>
									Kodér, autor originálního námětu.
								</div>
							</li>
							<li>
								<img src="/images/layout/vojta.png" alt="">
								<div>
									<strong>Vojtěch Šmíd</strong>
									Produkční, autor textů.
								</div>
							</li>
						</ul>
						<p>Mediální partner: <a href="https://www.facebook.com/TMBKOFFICIAL/" target="_blank" class="tmbk"><img src="/images/layout/tmbk.png" alt="TMBK"></a></p>
						<p>Hudba: <strong>Mindhole</strong>, <strong>Total Woods</strong></p>
						<p>Děkujeme: Radim Zeifart, Klára Slavíková, Tomáš Klíma, Vojta Urbánek, Franta, Vietsky, Von Schau a SYMBIO.</p>
						<p>Pište nám na <a href="mailto:vravoram@gmail.com">vravoram@gmail.com</a></p>
					</div>
				</div>
			</div>
		</div>
		<div class="layer layer--naked">
			<div class="layer__content">
				<div class="layer__center">
					<span class="scoreboard__nude">NUDE</span>
					<img src="/images/layout/cisar.png" alt="Císařovy nové šaty">
					<p>Vítej v nudistickém režimu! Zařaď se k&nbsp;PussyWalk elitě a&nbsp;zvládni dokončit hru s&nbsp;jediným životem... hodně štěstí!</p>
					<p><a href="" class="btn js-play-naked">Jdu na to</a></p>
				</div>
			</div>
		</div>
		<div class="layer layer--scoreboard">
			<div class="layer__content">
				<div class="layer__center">
					<div class="scoreboard__normal">
						<button id="scoreboard_close" class="layer__close"></button>
						<h3>Zodpovědní voliči</h3>
						<div id="scoreboard">
							<ul id="scoreboard_top3" class="scoreboard__list">
							</ul>
							<ul id="scoreboard_list" class="scoreboard__list">
							</ul>
						</div>
					</div>
					<div class="pacman"></div>
					<div class="scoreboard__too-bad">
						<p>Mohl/a jsi vidět své jméno v tabulce vítězů, bohužel ti ale do umístění chybí: <strong id="scoreboard__too-bad_time"></strong></p>
						<p>Už jen kousek a budeš mezi nejlepšími, vyzkoušej to znovu a rychleji!</p>
						<p><a href="" class="btn js-too-bad-play">Pokračuj</a></p>
						<div id="scoreboard__too-bad__share"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="nav">
			<ul class="nav__list">
				<li><a href="" class="nav__restart">Restart</a></li>
				<li><a href="" class="nav__quality nav__toggle">VYSOKÁ KVALITA</a></li>
				<li><a href="" class="nav__sound nav__toggle">ZVUK</a></li>
				<li><a href="" class="nav__score js-scoreboard-update">TABULKA VÍTĚZŮ</a></li>
				<li><a href="" data-layer="credits" class="nav__kill js-show-layer">PACHATELÉ</a></li>
				<li><a href="http://1.pussywalk.com" class="nav__game" target="_blank">PUSSYWALK I</a></li>
			</ul>
			<a href="" data-layer="merch" class="btn btn--pussy js-show-layer">Něco si kup</a>
		</div>
		<div class="nav-link"></div><div class="nav-link-bg"></div>
		<p class="disc">Jakákoliv podobnost se skutečnými postavami či událostmi je čistě náhodná ;)</p>
		<div class="game__scene"></div>
	
`
