class DiagramView {
  init() {
    this.$elem = $('.tableView');
    this.options = JSON.parse(this.$elem.attr('sb-widget-options'));
    this._prepareElem();
    this.drawDiagram();
    this.listenEvents();
  }

  getHeight() {
    return this.options.diagramState.width * (this.options.diagramState.horizontalDirection ? 0.3 : 1);
  }

  _prepareElem() {
    let it = this;
    this.$diagramElem = $("<div class='diagramElem'></div>");
    this.$elem.find(".diagramContainer").append(this.$diagramElem);
    if (!this.options.diagramState.width) {
      this.options.diagramState.width = this.$diagramElem[0].offsetWidth;
      this.options.diagramState.height = this.getHeight();
    }
    $(this.$elem.find(".diagramContainer")).resizable({
      resize: function (event, ui) {
        const svg = this.querySelector("svg");
        if ((ui.size.width - ui.originalSize.width > 20 || ui.size.width - ui.originalSize.width < -20) ||
          (ui.size.height - ui.originalSize.height > 20 || ui.size.height - ui.originalSize.height < -20)) {
          it.options.diagramState.width = ui.size.width;
          it.options.diagramState.height = ui.size.height;
          // it.$diagramElem[0].style.width = it.options.diagramState.width + "px";
          // it.$diagramElem[0].style.height = it.options.diagramState.height + "px";
          it.render()
        }

      }
    })
  }

  zoomDiagram(zoom, scale) {
    const svg = this.$diagramElem.find("svg")[0];
    if (!svg) {
      return;
    }

    const zoomIndex = this.options.diagramState.horizontalDirection ? 2 : 3;
    const viewBox = svg.getAttribute("viewBox").split(",");
    const changing = this.options.diagramState.horizontalDirection ? "width" : "height";
    const elemSize = Number.parseInt(this.options.diagramState[changing]);
    if (scale) {
      this._zoomScale = scale;
    } else {
      this._zoomScale *= zoom ? 0.9 : 1.1;
    }
    viewBox[zoomIndex] = elemSize * this._zoomScale;
    if (!zoom && viewBox[zoomIndex] >= elemSize) {
      viewBox[zoomIndex] = elemSize;
      this._zoomScale = 1;
    }
    svg.setAttribute("viewBox", viewBox.join(","));
    const zoomShift = (this.resizeMargin * this._zoomScale - this.resizeMargin) / this._zoomScale;
    svg.style.transform = `translate${this.options.diagramState.horizontalDirection ? "X" : "Y"}(${zoomShift}px)`;
    const textScale = this.options.diagramState.horizontalDirection ? `scaleX(${this._zoomScale})` : `scaleY(${this._zoomScale})`;
    $(svg).find("text").css('transform', textScale);
    const chartWidth = Math.floor(this.itemWidth / this._zoomScale);
    const textWidth = this.getTextElemWidth(this.maxXArgLength);
    if (this.options.diagramState.horizontalDirection && textWidth > chartWidth) {
      $(svg).find("text._rotated").css('transform', `${textScale} translate(-${textWidth / 3}px, ${textWidth / 3}px) rotate(-45deg)`)
      if (!svg.matches('[data-resized]')) {
        viewBox[3] = +viewBox[3] + textWidth / 1.5;
        svg.setAttribute("viewBox", viewBox.join(","));
        svg.setAttribute('data-resized', 'true');
      }
    } else {
      if (svg.matches('[data-resized]')) {
        viewBox[3] = +viewBox[3] - textWidth / 1.5;
        svg.setAttribute("viewBox", viewBox.join(","));
        svg.removeAttribute('data-resized');
      }
    }

    if (this.options.diagramState.horizontalDirection) {
      $(svg).find("[direction = 'vertical']").css('transform', `scaleX(${this._zoomScale})`);
    } else {
      $(svg).find("[direction = 'horizontal']").css('transform', `scaleY(${this._zoomScale})`);
    }
  }

  manageCurtains(position = {}) {

    this.mapPosition = $.extend(this.mapPosition, position);

    const slider = this.$elem.find(".map-slider")[0];
    const curtainStart = this.$elem.find(".curtain-start")[0];
    const curtainEnd = this.$elem.find(".curtain-end")[0];
    const part = this.options.diagramState.horizontalDirection ? "width" : "height";
    const move = this.options.diagramState.horizontalDirection ? "left" : "top";
    const all = Number.parseInt(this.$elem.find(".diagramMap > svg")[0].getAttribute(part));
    const diagram = this.$elem.find(".diagramSVG")[0];
    const viewBox = diagram.getAttribute("viewBox").split(",");
    viewBox[this.options.diagramState.horizontalDirection ? 0 : 1] = all * this.mapPosition.start;
    diagram.setAttribute("viewBox", viewBox.join(","));
    curtainStart.style[move] = "0";
    curtainStart.style[part] = this.mapPosition.start * all + "px";
    slider.style[move] = this.mapPosition.start * all + "px";
    slider.style[part] = (this.mapPosition.end - this.mapPosition.start) * all + "px";
    curtainEnd.style[move] = this.mapPosition.end * all + "px";
    curtainEnd.style[part] = (1 - this.mapPosition.end) * all + "px";
  }

  getData() {
    // Тут у нас будет логика обращения к серверу за данными.
    this._dataRequest = Promise.resolve({
      status: "ok", data: [
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "01-2020",
            value: "01-2020"
          },
          y: 98
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "01-2020",
            value: "01-2020"
          },
          y: 68
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "01-2020",
            value: "01-2020"
          },
          y: 10
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "02-2020",
            value: "02-2020"
          },
          y: 54
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "02-2020",
            value: "02-2020"
          },
          y: 86
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "02-2020",
            value: "02-2020"
          },
          y: 23
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "03-2020",
            value: "03-2020"
          },
          y: 31
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "03-2020",
            value: "03-2020"
          },
          y: 50
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "03-2020",
            value: "03-2020"
          },
          y: 29
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "04-2020",
            value: "04-2020"
          },
          y: 17
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "04-2020",
            value: "04-2020"
          },
          y: 22
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "04-2020",
            value: "04-2020"
          },
          y: 77
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "05-2020",
            value: "05-2020"
          },
          y: 48
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "05-2020",
            value: "05-2020"
          },
          y: 15
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "05-2020",
            value: "05-2020"
          },
          y: 11
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "06-2020",
            value: "06-2020"
          },
          y: 83
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "06-2020",
            value: "06-2020"
          },
          y: 99
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "06-2020",
            value: "06-2020"
          },
          y: 97
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "07-2020",
            value: "07-2020"
          },
          y: 48
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "07-2020",
            value: "07-2020"
          },
          y: 67
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "07-2020",
            value: "07-2020"
          },
          y: 50
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "08-2020",
            value: "08-2020"
          },
          y: 12
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "08-2020",
            value: "08-2020"
          },
          y: 24
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "08-2020",
            value: "08-2020"
          },
          y: 74
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "09-2020",
            value: "09-2020"
          },
          y: 35
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "09-2020",
            value: "09-2020"
          },
          y: 64
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "09-2020",
            value: "09-2020"
          },
          y: 70
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "10-2020",
            value: "10-2020"
          },
          y: 94
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "10-2020",
            value: "10-2020"
          },
          y: 61
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "10-2020",
            value: "10-2020"
          },
          y: 55
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "11-2020",
            value: "11-2020"
          },
          y: 91
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "11-2020",
            value: "11-2020"
          },
          y: 52
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "11-2020",
            value: "11-2020"
          },
          y: 62
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "12-2020",
            value: "12-2020"
          },
          y: 52
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "12-2020",
            value: "12-2020"
          },
          y: 67
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "12-2020",
            value: "12-2020"
          },
          y: 93
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "01-2021",
            value: "01-2021"
          },
          y: 63
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "01-2021",
            value: "01-2021"
          },
          y: 57
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "01-2021",
            value: "01-2021"
          },
          y: 89
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "02-2021",
            value: "02-2021"
          },
          y: 73
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "02-2021",
            value: "02-2021"
          },
          y: 13
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "02-2021",
            value: "02-2021"
          },
          y: 67
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "03-2021",
            value: "03-2021"
          },
          y: 87
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "03-2021",
            value: "03-2021"
          },
          y: 60
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "03-2021",
            value: "03-2021"
          },
          y: 50
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "04-2021",
            value: "04-2021"
          },
          y: 68
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "04-2021",
            value: "04-2021"
          },
          y: 89
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "04-2021",
            value: "04-2021"
          },
          y: 16
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "05-2021",
            value: "05-2021"
          },
          y: 68
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "05-2021",
            value: "05-2021"
          },
          y: 15
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "05-2021",
            value: "05-2021"
          },
          y: 13
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "06-2021",
            value: "06-2021"
          },
          y: 40
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "06-2021",
            value: "06-2021"
          },
          y: 63
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "06-2021",
            value: "06-2021"
          },
          y: 58
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "07-2021",
            value: "07-2021"
          },
          y: 96
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "07-2021",
            value: "07-2021"
          },
          y: 58
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "07-2021",
            value: "07-2021"
          },
          y: 48
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "08-2021",
            value: "08-2021"
          },
          y: 76
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "08-2021",
            value: "08-2021"
          },
          y: 43
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "08-2021",
            value: "08-2021"
          },
          y: 76
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "09-2021",
            value: "09-2021"
          },
          y: 87
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "09-2021",
            value: "09-2021"
          },
          y: 56
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "09-2021",
            value: "09-2021"
          },
          y: 34
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "10-2021",
            value: "10-2021"
          },
          y: 92
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "10-2021",
            value: "10-2021"
          },
          y: 55
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "10-2021",
            value: "10-2021"
          },
          y: 76
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "11-2021",
            value: "11-2021"
          },
          y: 87
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "11-2021",
            value: "11-2021"
          },
          y: 84
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "11-2021",
            value: "11-2021"
          },
          y: 83
        },
        {
          name: {
            caption: "Вася",
            value: "Вася"
          },
          x: {
            caption: "12-2021",
            value: "12-2021"
          },
          y: 52
        },
        {
          name: {
            caption: "Петя",
            value: "Петя"
          },
          x: {
            caption: "12-2021",
            value: "12-2021"
          },
          y: 98
        },
        {
          name: {
            caption: "Федя",
            value: "Федя"
          },
          x: {
            caption: "12-2021",
            value: "12-2021"
          },
          y: 51
        }
      ]
    });
    return this._dataRequest;
  }

  switchDirection() {
    this.options.diagramState.horizontalDirection = !this.options.diagramState.horizontalDirection;
    this.options.diagramState.height = this.getHeight();
    this.$elem.find(".diagramContainer")[0].style.height = this.options.diagramState.height + "px";
    this.render()

  }
  changeMode() {
    this.options.diagramState.stackMode = !this.options.diagramState.stackMode;
    this.render();
  }
  drawDiagram(dirtyData) {
    const it = this;
    const request = it.getData();
    request.then(function (result) {
      if (result.status == "ok") {
        it.diagramData = it._prepareData(result.data);
        it.render();
      }
    });
  }
  _prepareData(data) {
    // Группируем из массива объектов со свойствами {x, y, name} по свойству x. y переименовывыаем в value
    // На выходе ждем массив объектов {x, values: [{name, value}]}
    this.maxYArgLength = String(data.sort((a, b) => String(b.y).length - String(a.y).length)[0].y).length + 1;
    this.maxXArgLength = String(data.sort((a, b) => String(b.x.caption).length - String(a.x.caption).length)[0].x.caption).length;
    const tempData = [...data].map(item => {
      item.xCaption = item.x.caption;
      item.xValue = item.x.value;
      return item;
    })
    const groupData = _.groupBy(tempData, "xValue");
    return Object.keys(groupData).map(item => {
      return {
        item: item,
        values: groupData[item].map(groupedItem => { return { name: groupedItem.name.caption, nameValue: groupedItem.name.value, xValue: groupedItem.xValue, value: groupedItem.y } })
      }
    })
  }
  getMaxValue(data, personal) {
    // Выявляем максимальное value
    // Есть два варианта, либо просто максимальное значение - тогда просто в две ступени выбираем максимальное. Сначала для каждого item, а потом и между всеми item'ами
    // Либо максимальная сумма валуе внутри одного item. Для этого для каждого item суммируем его value и выбираем максимальное.
    // Полученный результат умножаем на 1.05, чтобы при построении диаграммы максимальное значение не упиралось в потолок.
    return (personal ?
      Math.max(...data.map(item => Math.max(...item.values.map(it => it.value)))) :
      Math.max(...data.map(item => item.values.reduce((sum, elem) => sum + elem.value, 0)))) * 1.05;
  }
  getMaxItemsCount(data) {
    // Считаем максимальное кол-во value для одного item'а
    return Math.max(...data.map(item => item.values.length));
  }

  getTextElemWidth(length) {
    return (this.fontSize * length) / 2 + 12;
  }

  render() {
    const padding = 0.1;
    const minGistWidth = 25;
    this.mapWidth = 50;
    this._zoomScale = 1;
    const options = this.options.diagramState;
    const data = options.horizontalDirection ? this.diagramData : [...this.diagramData].reverse();
    const maxValue = this.getMaxValue(data, options.stackMode);
    const maxItemsCount = this.getMaxItemsCount(data);
    const width = this.options.diagramState.width - (options.horizontalDirection ? 0 : (this.mapWidth + 10));
    const height = this.options.diagramState.height - (options.horizontalDirection ? this.mapWidth : 0);
    this.fontSize = Number.parseInt(getComputedStyle(this.$diagramElem[0]).fontSize);
    const margin = {
      top: options.horizontalDirection ? 0 : this.fontSize + 10,
      bottom: options.horizontalDirection ? this.fontSize + 10 : 0,
      left: options.horizontalDirection ? this.getTextElemWidth(this.maxYArgLength) : this.getTextElemWidth(this.maxXArgLength),
      right: 0
    }
    this.resizeMargin = options.horizontalDirection ? margin.left : margin.top;


    this.$elem.find(".diagramSVG").remove();
    this.$elem.find(".legend").remove();
    this.$elem.find(".diagramMap").remove();

    this.$elem.find(".diagramContainer")[0].style["flex-direction"] = options.horizontalDirection ? "column" : "row";

    // Спецобъекты типа Scale расчитывают за нам ширину объектов и их координаты, исходя из заданной рабочей области и значения.
    // Если обратиться к ним как к функции и передать порядковый номер элемента - получим начальную координату для этого элемента на рабочей области
    // Если обратиться к методу bandwidth() такого объекта, он вернет расчитанную ширину объекта на рабочей области.

    // Создаем специальный объект, который будет отвечать за расчет ширины итема(ось X при стандартном направлении и ось Y при повернутом.) и их координату
    // В качестве мин-макс задаем интевал между 0 и кол-вом итемов
    // В качестве шкалы в пикселях задаем рабочую область (по ширине или по высотве, в зависимости от направления)
    // Добавляем коэфицент паддингов, чтобы между итемами был промежуток 
    const itemWidthScale = d3.scaleBand()
      .domain(d3.range(data.length))
      .range(options.horizontalDirection ?
        [margin.left, width - margin.right] :
        [height - margin.bottom, margin.top])
      .padding(padding);
    // Создаем специальный объект, который будет отвечать за расчет ширины конкретного value (ось X при стандартном направлении и ось Y при повернутом.) и их координату
    // В качестве мин-макс задаем интевал между 0 и максимальным кол-вом value на один item
    // В качестве шкалы в пикселях задаем диапазон от 0 до ширины одного item'а
    // Добавляем коэфицент паддингов, чтобы между value был промежуток 
    const valueWidthScale = d3.scaleBand()
      .domain(d3.range(maxItemsCount))
      .range([0, itemWidthScale.bandwidth()])
      .padding(padding * 2);
    // Создаем специальный объект для определения высоты value на диаграмме и ее коодинтаы
    // В качестве мин-макс задаем интевал между 0 и максимальным value
    // В качестве шкалы в пикселях задаем рабочую область (по ширине или по высотве, в зависимости от направления)
    const valueHeightScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range(options.horizontalDirection ?
        [height - margin.bottom, margin.top] :
        [width - margin.right, margin.left]);
    // Создаем альтернативный объект с инвертированной шкалой.
    const valueHeightScaleAlt = d3.scaleLinear()
      .domain([maxValue, 0])
      .range(options.horizontalDirection ?
        [height - margin.bottom, margin.top] :
        [width - margin.right, margin.left]);

    // Создаем специальную функцию, которая при получении аргумента от 1 до 10 возвращает соответсвующий цвет из предопределенного списка.
    const color = d3.scaleOrdinal([], d3.schemeCategory10);
    // Создаем массив, в который будем складывать задействованные цвета в связске с именами. Потом на основе этого построим Легенду.
    let colorSet = [];
    // Проходимся по всем данным и делаем специальную подготовку, чтобы потом по данным можно было рисовать диаграмму.
    for (let i = 0; i < data.length; i++) {
      // Берем итем из данных
      const item = data[i];
      // Задаем ему ширину, обратившись к спрецобъекту
      item.width = itemWidthScale.bandwidth();
      // Задаем ему начальную координату, обратившись к спрецобъекту.
      item.xStart = itemWidthScale(i);
      // Если включен групповой режим а value у данного itema меньше, то нужно поправить начальную координату
      // value начинают рисоваться от начала начальной координаты item'a. Сдвигаем начальную координату item'a на половину ширины недостающих value с учетом паддингов
      if (options.stackMode && item.values.length < maxItemsCount) {
        const difference = maxItemsCount - item.values.length;
        item.xStart += (valueWidthScale.bandwidth() * (1 + padding) * difference) / 2;
      }
      // Для накопительного режима нам понадобится для каждого value хранить сумму его предшественников
      let heightSum = 0;
      // Для накопительного режима в повернутом состоянии нам понадобится для каждого value сдвиг.
      let shift = 0;
      for (let j = 0; j < item.values.length; j++) {
        const valueItem = item.values[j];
        // Задаем ширину value, обратившись к спрецобъекту. Если мы в накопительном режиме - то берем ширину item'а
        valueItem.width = options.stackMode ? valueWidthScale.bandwidth() : item.width;
        // Задаем ему начальную координату, обратившись к спрецобъекту.
        valueItem.xStart = options.stackMode ? valueWidthScale(j) + item.xStart : item.xStart;
        // Накапливаем высоту.
        heightSum += valueItem.value;
        // Задаем координату по y исходя из накопленной высоты
        valueItem.yStart = heightSum;
        // Задаем накопленный сдвиг
        valueItem.shift = shift;
        // Накапливаем сдвиг
        shift += valueItem.value;
        // Сохраняем имея item'а, к которму относится данный value. В иттерациях d3 доступа к родителю уже не будет
        valueItem.itemName = item.item;
        // Задаем пустую переменную для цвета
        let colorValue;
        // Смотрим, есть ли в colorSet цвет для данного name
        const colorItem = colorSet.filter(item => item.name == valueItem.name)[0];
        if (!colorItem) {
          // Если нет - создаем новую связку имени и цвета. Цвет получаем от спецфункции color
          const colorItemNew = {
            name: valueItem.name,
            color: color(colorSet.length)
          };
          // Отмечаем, что для данного name уже выбран цвет.
          colorSet.push(colorItemNew);
          colorValue = colorItemNew.color;
        } else {
          colorValue = colorItem.color;
        }
        // Сохраняем данные по выбранному цвету
        valueItem.color = colorValue;
      }

    }
    // Создаем функцию, которая будет рисовать шкалу по оси y
    function yAxis(g) {
      // Задаем сдвиги, чтобы ось была где нужно
      g.attr("transform", options.horizontalDirection ? `translate(${margin.left}, 0)` : `translate(0 , ${margin.top})`)
        // Запускаем отрисовку шкалы, исходя из направления. 
        .call(options.horizontalDirection ?
          d3.axisLeft(valueHeightScale).ticks(null, data.format) :
          d3.axisTop(valueHeightScaleAlt).ticks(null, data.format))
        // Устанавливаем размер шрифта для подписей
        .attr("font-size", '1em');

      // Видоизменяем нарисованные линии
      g.selectAll('line')
        // задаем координаты конца для вспомогательных линий
        .attr(options.horizontalDirection ? "x2" : "y2",
          options.horizontalDirection ?
            width - margin.left - margin.right :
            height - margin.top - margin.bottom)
        // Задаем ширину линий и вешаем на них класс
        .attr("stroke-width", "1px")
        .attr("class", `back-line`)
        .attr("direction", options.horizontalDirection ? "horizontal" : "vertical");
      g.selectAll('path').attr("direction", options.horizontalDirection ? "vertical" : "horizontal")
    }
    // Создаем функцию, которая будет рисовать шкалу по оси x
    // Исходя из опций задаем сдвиги и позиционирование
    function xAxis(g) {
      g.attr("transform", options.horizontalDirection ? `translate(0,${height - margin.bottom})` : `translate(${margin.left}, 0)`)
        .call(options.horizontalDirection ? d3.axisBottom(itemWidthScale).tickFormat(i => data[i].item) : d3.axisLeft(itemWidthScale).tickFormat(i => data[i].item))
        // Устанавливаем размер шрифта для подписей
        .attr("font-size", '1em');
      g.selectAll('line').attr("direction", options.horizontalDirection ? "vertical" : "horizontal");
      if (options.horizontalDirection) {
        g.selectAll('text').attr("class", "_rotated");
      }



    }
    // Создаем svg
    const svg = d3.selectAll(this.$diagramElem)
      .append('svg')
      .attr("class", "diagramSVG")
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "none")
      .attr("width", width + "px")
      .attr("height", height + "px")
    // Рисуем шкалы по X и Y
    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);
    this.$elem.find(".diagramSVG")[0].style.overflow = "initial";
    // Добавляем группу
    svg
      .append("g")
      .attr("class", "diagramGroup")
      .selectAll(".diagramGroup")
      // Проходимся по каждому item
      .data(data)
      .enter()
      .selectAll("g")
      // Добавляем для него совю группу
      .append("g")
      // Разбиваем item на совокупность его value
      .data((d, m) => {
        return data[m].values;
      })
      .enter()
      // Для каждого value создаем rect
      .append("rect")
      // Берем его цвет
      .attr("fill", d => d.color)
      // Задаем координаты начала value. В зависимости от направления делаем это по разному.
      .attr(options.horizontalDirection ? "x" : "y", (d) => d.xStart)
      .attr(options.horizontalDirection ? "y" : "x", d => options.horizontalDirection ?
        (options.stackMode ? valueHeightScale(d.value) : valueHeightScale(d.yStart)) :
        (options.stackMode ? valueHeightScale(maxValue) : valueHeightScale(maxValue - d.shift)))
      // Добавляем классы
      .attr("class", options.horizontalDirection ? "chart" : "chart _horizontal")
      // Задаем ширину и высоту. В зависимоти от направления делаем это по разному
      .attr(options.horizontalDirection ? "height" : "width", d => valueHeightScale(0) - valueHeightScale(d.value))
      .attr(options.horizontalDirection ? "width" : "height", d => d.width)
      // Вставлем внутрь title, чтобы получить hint при наведении мыши.
      .append("title")
      .text(d => `${d.itemName} \r\n${d.name}: ${d.value} `);

    if (options.stackMode) {
      svg
        .append("g")
        .attr("class", "separators")
        .selectAll(".diagramGroup")
        // Проходимся по каждому item
        .data(data)
        .enter()
        .append("rect")
        .attr('x', options.horizontalDirection ? (d) => d.xStart + d.width : margin.left)
        .attr('y', options.horizontalDirection ? 0 : (d) => d.xStart + d.width)
        .attr('height', options.horizontalDirection ? height - margin.bottom : "1px")
        .attr("width", options.horizontalDirection ? "1px" : width - margin.left)
        .attr("fill", "grey")
        .attr("class", "diagram-separator");


    }

    let map = svg.node().querySelector(".diagramGroup").cloneNode(true);
    const mapDiv = d3.selectAll(this.$elem.find(".diagramContainer"))
      .append('div')
      .attr("class", "diagramMap");

    mapDiv.append('svg')
      .attr("width", options.horizontalDirection ? width : this.mapWidth + "px")
      .attr("height", options.horizontalDirection ? this.mapWidth : height + "px")
      .attr("viewBox", [margin.left, margin.top, width - margin.left, height - margin.top])
      .attr("preserveAspectRatio", "none")
      .node()
      .append(map);
    map = mapDiv.node();

    map.style.position = "relative";
    map.style[options.horizontalDirection ? "height" : "width"] = this.mapWidth + "px";
    map.style.marginLeft = options.horizontalDirection ? "" : "10px";
    const slider = document.createElement("div");
    slider.className = "map-slider";
    slider.setAttribute("draggable", false)
    const moverStart = document.createElement("div");
    moverStart.setAttribute("draggable", false)
    moverStart.className = "mover mover-start";
    const moverEnd = document.createElement("div");
    moverEnd.setAttribute("draggable", false)
    moverEnd.className = "mover mover-end";
    if (options.horizontalDirection) {
      moverStart.style.left = 0;
      moverEnd.style.left = "100%";
    } else {
      moverStart.style.top = 0;
      moverEnd.style.top = "100%";
    }
    const movers = [moverStart, moverEnd];
    for (const mover of movers) {
      mover.style[options.horizontalDirection ? 'top' : 'left'] = "0";
      mover.style[options.horizontalDirection ? 'height' : 'width'] = "100%";
      mover.style[options.horizontalDirection ? 'width' : 'height'] = "16px";
      mover.style.transform = `translate${options.horizontalDirection ? 'X' : 'Y'}(-50%)`;
      if (!options.horizontalDirection) {
        mover.classList.add("_vertical");
      }
    }

    slider.append(moverStart);
    slider.append(moverEnd);
    this.startMoving = (ev) => {
      const target = document.querySelector(".drag-moving");
      if (!target) {
        return;
      }
      const shift = options.horizontalDirection ? ev.movementX : ev.movementY;
      if (shift == 0) {
        return;
      }

      const map = target.closest(".diagramMap").querySelector("svg");
      const mapSize = Number.parseInt(map.getAttribute(options.horizontalDirection ? "width" : "height"));
      const mapStart = map.getBoundingClientRect()[options.horizontalDirection ? "x" : "y"];
      const slider = target.closest(".diagramMap").querySelector(".map-slider");
      const sliderSize = Number.parseInt(slider.style[options.horizontalDirection ? "width" : "height"]);
      const sliderStart = slider.getBoundingClientRect()[options.horizontalDirection ? "x" : "y"] - mapStart;
      const start = (sliderStart + ((target.matches(".mover-start") || target.matches(".map-slider")) ? shift : 0)) / mapSize;
      const end = (sliderStart + sliderSize + ((target.matches(".mover-end") || target.matches(".map-slider")) ? shift : 0)) / mapSize;
      if (start < 0 || end > 1 || start >= end) {
        return;
      }
      this.manageCurtains({ start: start, end: end });
      if (target.matches(".mover-start") || target.matches(".mover-end")) {

        this.zoomDiagram(true, this.mapPosition.end - this.mapPosition.start);
      }

    }
    this.stopMoving = () => {
      if (document.querySelector(".drag-moving")) {
        document.querySelector(".drag-moving").classList.remove("drag-moving");
        document.removeEventListener("mousemove", this.startMoving);
        document.removeEventListener("mouseup", this.stopMoving);
      }
    }
    slider.addEventListener("mousedown", (ev) => {
      ev.target.classList.add("drag-moving");
      document.addEventListener("mousemove", this.startMoving);
      document.addEventListener("mouseup", this.stopMoving)
    })



    const curtainStart = document.createElement("div");
    curtainStart.className = "curtain curtain-start";
    const curtainEnd = document.createElement("div");
    curtainEnd.className = "curtain curtain-end";

    const full = this.options.diagramState.horizontalDirection ? "height" : "width";
    const zero = this.options.diagramState.horizontalDirection ? "top" : "left";
    const translate = this.options.diagramState.horizontalDirection ? "Y" : "X";
    const elems = [slider, curtainStart, curtainEnd];
    for (let elem of elems) {
      elem.style[full] = "100%";
      elem.style[zero] = "50%";
      elem.style.transform = `translate${translate}(-50%)`;
    }

    map.append(curtainStart);
    map.append(curtainEnd);
    map.append(slider);

    this.manageCurtains({ start: 0, end: 1 });
    const finalChartWidth = options.stackMode ? valueWidthScale.bandwidth() : itemWidthScale.bandwidth();
    this.itemWidth = itemWidthScale.bandwidth();
    if (finalChartWidth < minGistWidth) {
      this.zoomDiagram(true, finalChartWidth / minGistWidth)
      this.manageCurtains({ end: finalChartWidth / minGistWidth });
    }


    // Вставляем контейнер, где будем отображдать легенду
    const legend = d3.selectAll(this.$elem)
      .append('div')
      .attr("class", "legend")
    // Закладываем место по каждый legendItem по кол-ву элементов в colorSet
    var elem = legend.selectAll("g")
      .data(colorSet)
    // На каждый элемент в colorSet создаем legend-item
    var legendItem = elem.enter()
      .append("div")
      .attr("class", "legend-item")
    // На каждый элемент в legend-item создаем квадратик с нужным цветом
    legendItem
      .append("svg")
      .attr("height", 20)
      .attr("width", 20)
      .append("rect")
      .attr("fill", d => d.color)
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", 20)
      .attr("width", 20)
      .node();
    // На каждый элемент в legend-item создаем текстовый элемент с именем
    legendItem
      .append("span")
      .text(d => d.name)
    this.$elem.find(".diagramContainer").after(this.$elem.find(".legend"));
  }

  listenEvents() {
    this.$elem.on('click', (ev) => {
      const target = ev.target.closest('[data-action]');
      if (!target) {
        return;
      }
      const action = target.dataset.action;
      this[action]();
    })
  }


}

const diagram = new DiagramView();
diagram.init();

document.addEventListener("mouseover", (ev) => {
  const target = ev.target;
  if (target.matches(".chart") && !target.matches("._active")) {
    target.classList.add("_active");
    let attr = target.matches("._horizontal") ? "height" : "width";
    let dimension = target.matches("._horizontal") ? "y" : "x";
    const size = +target.getAttribute(attr);
    const place = +target.getAttribute(dimension);
    target.setAttribute("orig-size", size);
    target.setAttribute("orig-place", place);
    target.setAttribute(attr, size * 1.1);
    target.setAttribute(dimension, +target.getAttribute(dimension) - size * 0.05);
  }
})
document.addEventListener("mouseout", (ev) => {
  const target = ev.target;
  if (target.matches(".chart") && target.matches("._active")) {
    target.classList.remove("_active");
    let attr = target.matches("._horizontal") ? "height" : "width";
    let dimension = target.matches("._horizontal") ? "y" : "x";
    target.setAttribute(attr, +target.getAttribute("orig-size"));
    target.setAttribute(dimension, +target.getAttribute("orig-place"))
  }
})