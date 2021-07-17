(function($) {

	var	$window = $(window),
	$body = $('body');



	// Play initial animations on page load.
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
		}, 100);
	});

	// Touch?
	if (browser.mobile)
		$body.addClass('is-touch');

	// Forms.
	var $form = $('form');

		// Auto-resizing textareas.
		$form.find('textarea').each(function() {

			var $this = $(this),
			$wrapper = $('<div class="textarea-wrapper"></div>'),
			$submits = $this.find('input[type="submit"]');

			$this
			.wrap($wrapper)
			.attr('rows', 1)
			.css('overflow', 'hidden')
			.css('resize', 'none')
			.on('keydown', function(event) {

				if (event.keyCode == 13
					&&	event.ctrlKey) {

					event.preventDefault();
				event.stopPropagation();

				$(this).blur();

			}

		})
			.on('blur focus', function() {
				$this.val($.trim($this.val()));
			})
			.on('input blur focus --init', function() {

				$wrapper
				.css('height', $this.height());

				$this
				.css('height', 'auto')
				.css('height', $this.prop('scrollHeight') + 'px');

			})
			.on('keyup', function(event) {

				if (event.keyCode == 9)
					$this
				.select();

			})
			.triggerHandler('--init');

				// Fix.
				if (browser.name == 'ie'
					||	browser.mobile)
					$this
				.css('max-height', '10em')
				.css('overflow-y', 'auto');

			});

	// Menu.
	var $menu = $('#menu');

	$menu.wrapInner('<div class="inner"></div>');

	$menu._locked = false;

	$menu._lock = function() {

		if ($menu._locked)
			return false;

		$menu._locked = true;

		window.setTimeout(function() {
			$menu._locked = false;
		}, 350);

		return true;

	};

	$menu._show = function() {

		if ($menu._lock())
			$body.addClass('is-menu-visible');

	};

	$menu._hide = function() {

		if ($menu._lock())
			$body.removeClass('is-menu-visible');

	};

	$menu._toggle = function() {

		if ($menu._lock())
			$body.toggleClass('is-menu-visible');

	};

	$menu
	.appendTo($body)
	.on('click', function(event) {
		event.stopPropagation();
	})
	.on('click', 'a', function(event) {

		var href = $(this).attr('href');

		event.preventDefault();
		event.stopPropagation();

				// Hide.
				$menu._hide();

				// Redirect.
				if (href == '#menu')
					return;

				window.setTimeout(function() {
					window.location.href = href;
				}, 350);

			})
	.append('<a class="close" href="#menu">Close</a>');

	$body
	.on('click', 'a[href="#menu"]', function(event) {

		event.stopPropagation();
		event.preventDefault();

				// Toggle.
				$menu._toggle();

			})
	.on('click', function(event) {

				// Hide.
				$menu._hide();

			})
	.on('keydown', function(event) {

				// Hide on escape.
				if (event.keyCode == 27)
					$menu._hide();

			});

})(jQuery);

/* About Me Carousel */ 
let activeIndex = 0
let limit = 0
let disabled = false
let $stage
let $controls
let canvas = false

const SPIN_FORWARD_CLASS = 'js-spin-fwd'
const SPIN_BACKWARD_CLASS = 'js-spin-bwd'
const DISABLE_TRANSITIONS_CLASS = 'js-transitions-disabled'
const SPIN_DUR = 1000

const appendControls = () => {
	for (let i = 0; i < limit; i++) {
		$('.carousel__control').append(`<a href="#" data-index="${i}"></a>`)
	}
	let height = $('.carousel__control').children().last().outerHeight()

	$('.carousel__control').css('height', (30 + (limit * height)))
	$controls = $('.carousel__control').children()
	$controls.eq(activeIndex).addClass('active')
}

const setIndexes = () => {
	$('.spinner').children().each((i, el) => {
		$(el).attr('data-index', i)
		limit++
	})
}

const duplicateSpinner = () => {
	const $el = $('.spinner').parent()
	const html = $('.spinner').parent().html()
	$el.append(html)
	$('.spinner').last().addClass('spinner--right')
	$('.spinner--right').removeClass('spinner--left')
}

const paintFaces = () => {
	$('.spinner__face').each((i, el) => {
		const $el = $(el)
		let color = $(el).attr('data-bg')
		$el.children().css('backgroundImage', `url(${getBase64PixelByColor(color)})`)
	})
}

const getBase64PixelByColor = (hex) => {
	if (!canvas) {
		canvas = document.createElement('canvas')
		canvas.height = 1
		canvas.width = 1
	}
	if (canvas.getContext) {
		const ctx = canvas.getContext('2d')
		ctx.fillStyle = hex
		ctx.fillRect (0, 0, 1, 1)
		return canvas.toDataURL()
	}
	return false
}

const prepareDom = () => {
	setIndexes()
	paintFaces()
	duplicateSpinner()
	appendControls()
}

const spin = (inc = 1) => {
	if (disabled) return
		if (!inc) return
			activeIndex += inc
		disabled = true

		if (activeIndex >= limit) {
			activeIndex = 0
		}

		if (activeIndex < 0) {
			activeIndex = (limit - 1)
		}

		const $activeEls = $('.spinner__face.js-active')
		const $nextEls = $(`.spinner__face[data-index=${activeIndex}]`)
		$nextEls.addClass('js-next')

		if (inc > 0) {
			$stage.addClass(SPIN_FORWARD_CLASS)
		} else {
			$stage.addClass(SPIN_BACKWARD_CLASS)
		}

		$controls.removeClass('active')
		$controls.eq(activeIndex).addClass('active')

		setTimeout(() => {
			spinCallback(inc)
		}, SPIN_DUR, inc)
	}

	const spinCallback = (inc) => {

		$('.js-active').removeClass('js-active')
		$('.js-next').removeClass('js-next').addClass('js-active')
		$stage
		.addClass(DISABLE_TRANSITIONS_CLASS)
		.removeClass(SPIN_FORWARD_CLASS)
		.removeClass(SPIN_BACKWARD_CLASS)

		$('.js-active').each((i, el) => {
			const $el = $(el)
			$el.prependTo($el.parent())
		})
		setTimeout(() => {
			$stage.removeClass(DISABLE_TRANSITIONS_CLASS)
			disabled = false
		}, 100)

	}

	const attachListeners = () => {

		document.onkeyup = (e) => {
			switch (e.keyCode) {
				case 38:
				spin(-1)
				break
				case 40:
				spin(1)
				break
			}
		}

		$controls.on('click', (e) => {
			e.preventDefault()
			if (disabled) return
				const $el = $(e.target)
			const toIndex = parseInt($el.attr('data-index'), 10)
			spin(toIndex - activeIndex)

		})
	}

	const assignEls = () => {
		$stage = $('.carousel__stage')
	}

	const init = () => {
		assignEls()
		prepareDom()
		attachListeners()
	}


	$(() => {
		init();
	});

// Back to Top
$(document).ready(function(){ 
	$(window).scroll(function(){ 
		if ($(this).scrollTop() > 100) { 
			$('#scroll').fadeIn(); 
		} else { 
			$('#scroll').fadeOut(); 
		} 
	}); 
	$('#scroll').click(function(){ 
		$("html, body").animate({ scrollTop: 0 }, 600); 
		return false; 
	}); 
});

// Images Modal

function openModal() {
	document.getElementById("myModal").style.display = "block";
	$('wrappper').css('overflow', 'hidden');
	$('body').css('overflow', 'hidden');
	$('.menu').hide();
}

function closeModal() {
	document.getElementById("myModal").style.display = "none";
	$('body').css('overflow', 'auto');
}

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
	showSlides(slideIndex += n);
}

function currentSlide(n) {
	showSlides(slideIndex = n);
}

function showSlides(n) {
	var i;
	var slides = document.getElementsByClassName("mySlides");
	var dots = document.getElementsByClassName("demo");
	if (n > slides.length) {slideIndex = 1}
		if (n < 1) {slideIndex = slides.length}
			for (i = 0; i < slides.length; i++) {
				slides[i].style.display = "none";
			}
			for (i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(" active", "");
			}
			slides[slideIndex-1].style.display = "block";
			dots[slideIndex-1].className += " active";
			captionText.innerHTML = dots[slideIndex-1].alt;
		}