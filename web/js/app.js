'use strict';

var BookInfoButton = React.createClass({
  render: function() {
      var btnClass = "btn btn-primary book-info";
      if (this.props.disabled) btnClass += " disabled";

      return (
          <button type="button" 
                  className={btnClass}
                  >{this.props.label}</button>);
  }
});

var SortingHat = React.createClass({
    render: function () {
        return (
            <div className="col-pull-lg-3">
              <div className="btn-group sorting-hat">
                <button type="button" className="btn btn-sm">by price</button>
                <button type="button" className="btn btn-sm">by date</button>
                <button type="button" className="btn btn-sm">alphabetically</button>
              </div>
            </div>
        );
    }
});

var BookContainer = React.createClass({
    select: function (event) {
        if (this.props.onSelect)
            this.props.onSelect(this.props.data);
    },
    render: function () {
        return (
            <div className="container book-container">
              <div className="row book">
                <div className="col-lg-9 white">
                  <div className="book-icon-placeholder"
                       onClick={this.select}>
                    <img className="book-icon desaturate"
                         src={this.props.thumb}/>
                  </div>
                </div>
                <div className="col-pull-lg-1">
                  <div className="book-info">
                    <div className="btn-group-vertical">
                      <div className="book-info">
                        <div className="btn-group-vertical">
                          <BookInfoButton label={this.props.country}/>
                          <BookInfoButton label={this.props.price}/>
                          <BookInfoButton label="EPUB"
                            disabled={this.props.epub}/>
                          <BookInfoButton label="PDF"
                            disabled={this.props.pdf}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>);
    }
});

var PreviewList = React.createClass({
    formatPrice: function (listPrice) {
        switch ((listPrice || {}).currencyCode || "NA") {
        case "USD": return "$" + listPrice.amount;
        case "EUR": return listPrice.amount + "€";
        case "ILS": return listPrice.amount + "₪";
        case "NA": return "NA";
        default: return listPrice.amount + " " + listPrice.currencyCode;
        }
    },
    onSelect: function (data) {
        if (this.props.onSelect) this.props.onSelect(data);
    },
    render: function () {
        var that = this;
        return (
            <div className="row middle-row shadow">
              <div className="col-lg-10">
                <ul className="list-inline">
                  {this.props.previews.map(function (data) {
                    return (
                        <li><BookContainer
                             thumb={data.volumeInfo.imageLinks.thumbnail}
                             country={data.saleInfo.country}
                             epub={data.accessInfo.epub.isAvailable}
                             pdf={data.accessInfo.pdf.isAvailable}
                             price={that.formatPrice(data.saleInfo.listPrice)}
                             data={data}
                             onSelect={that.onSelect}
                          />
                        </li>
                    );
                  })}
                </ul>
              </div>
            </div>);
    }
});

var Header = React.createClass({
    sortHandler: function (criteria) {
        if (this.props.sortHandler) 
            this.props.sortHandler(criteria);
    },
    render: function () {
        return (
            <div className="row top-row">
              <div className="col-lg-9">
                <h6 className="bevel">Book search</h6>
              </div>
              <SortingHat sortHandler={this.sortHandler}/>
            </div>);
    }
});

var BookDetails = React.createClass({
    renderRating: function () {
        var result = "", rating = this.props.rating;
        for (var i = 0; i < 5; i++)
            result += i < rating ? "★" : "☆";
        return result;
    },
    formatISBN: function () {
        return this.props.isbn ? "ISBN: " + this.props.isbn : "";
    },
    createDescription: function () {
        return { __html: this.props.description };
    },
    render: function () {
        return (
            <div className="col-lg-pull-4 no-padding">
              <div className="row">
                <h2>{this.props.title}</h2>
                <h3>{this.props.subtitle}</h3>
                {this.props.authors.map(function (author) {
                    return <h4 className="author">{author}</h4>;
                })}
                <p className="description"
                   dangerouslySetInnerHTML={this.createDescription()}/>
              </div>
              <div className="row medium-dark">
                <h4 className="right-aligned right-padded"
                   >{this.props.publisher}</h4>
                <h4 className="right-aligned right-padded"
                   >{this.formatISBN()}</h4>
                <h5 className="right-aligned right-padded"
                   >{this.props.date}</h5>
              </div>
              <div className="row dark">
                <h4 id="ranking" className="right-aligned right-padded"
                  >{this.renderRating()}</h4>
              </div>
            </div>);
    }
});

var Plot = React.createClass({
    renderPlot: function () {
        var d1 = [];
		for (var i = 0; i < Math.PI * 2; i += 0.25)
			d1.push([i, Math.sin(i)]);

		var d2 = [];
		for (var i = 0; i < Math.PI * 2; i += 0.25)
			d2.push([i, Math.cos(i)]);

		var d3 = [];
		for (var i = 0; i < Math.PI * 2; i += 0.1)
			d3.push([i, Math.tan(i)]);

		$.plot("#plot", [
			{ label: "sin(x)", data: d1, color: "#5E664D" },
			{ label: "cos(x)", data: d2 },
			{ label: "tan(x)", data: d3 }
		], {
			series: {
				lines: { show: true },
				points: { show: true }
			},
			xaxis: {
				ticks: [
					0, [ Math.PI/2, "\u03c0/2" ], [ Math.PI, "\u03c0" ],
					[ Math.PI * 3/2, "3\u03c0/2" ], [ Math.PI * 2, "2\u03c0" ]
				]
			},
			yaxis: { ticks: 10, min: -2, max: 2, tickDecimals: 3 },
			grid: {
				backgroundColor: "#EEE2E6",
				borderWidth: { top: 4, right: 4, bottom: 4, left: 4 },
                borderColor: "#A99C9A"
			}
		});
    },
    render: function () {
        return (
            <div className="col-lg-12">
              <div className="row">
                <div id="plot"></div>
              </div>
              <div className="row">
                <div className="left-padded">
                  <p>What kind of data is presented in this graph</p>
                </div>
              </div>
            </div>);
    },
    componentDidMount: function () { this.renderPlot(); }
});

var GViewer = React.createClass({
    getInitialState: function () { return { viewer: null }; },
    initGapi: function () {
        var that = this;
        // If I don't use callback, this code will use document.write...
        google.load("books", "0", { callback: _.identity });
    },
    render: function () {
        return (
            <div className="row plot-row">
              <div id="gviewer-wrapper">
                <div id="gviewer"/>
              </div>
            </div>);
    },
    componentDidMount: function () { this.initGapi(); },
    loadFail: function (data) {
        console.log("failed loading: " + this.props.selected);
    },
    loadSuccess: function (data) {
        console.log("loaded: " + this.props.selected);
    },
    componentDidUpdate: function () {
        var elt = $("#gviewer");
        elt.empty();
        var viewer = new google.books.DefaultViewer(elt.get(0));
        viewer.load(this.props.selected, this.loadFail, this.loadSuccess);
    }
});

var SearchBox = React.createClass({
    search: function () {
        var val = $("#search").val();
        if (val && this.props.searchHandler)
            this.props.searchHandler(val);
    },
    keyup: function (event) {
        if (event.which == 13) this.search();
    },
    render: function () {
        return (
            <div className="row plot-row">
              <div className="col-lg-10">
                <div className="form-group pad-more">
                  <input type="text" 
                         className="form-control"
                         id="search"
                         onKeyUp={this.keyup}
                         placeholder="Search for books"/>
                </div>
              </div>
              <div className="col-lg-2 white pad-more pad-two">
                <button type="submit" 
                        id="submit"
                        className="btn btn-primary"
                        onClick={this.search}>Search</button>
              </div>
            </div>);
    }
});

var ViewerPane = React.createClass({
    searchHandler: function (data) {
        if (this.props.searchHandler) this.props.searchHandler(data);
    },
    render: function () {
        return (
            <div className="col-lg-5 white no-padding">
              <SearchBox searchHandler={this.searchHandler}/>
              <div className="row plot-row">
                <div className="col-lg-8">
                  <GViewer selected={this.props.selected}/>
                </div>
                  <BookDetails
                    title={this.props.active.title}
                    subtitle={this.props.active.subtitle}
                    description={this.props.active.description}
                    authors={this.props.active.authors}
                    rating={this.props.active.averageRating}
                    publisher={this.props.active.publisher}
                    date={this.props.active.publishDate}
                    isbn={this.props.active.industryIdentifiers[0].identifier}
                    />
              </div>
            </div>);
    }
});

var ContentPane = React.createClass({
    searchHandler: function (data) {
        if (this.props.searchHandler)
            this.props.searchHandler(data);
    },
    render: function () {
        return (
            <div className="row bottom-row light plot-row">
              <ViewerPane
                searchHandler={this.searchHandler}
                selected={this.props.selected}
                active={this.props.active}
                />
              <div className="col-lg-7 no-padding">
                <div className="row plot-row medium-dark">
                  <h2 className="light-text">Statistics</h2>
                </div>
                <div className="row plot-row">
                  <Plot/>
                </div>
              </div>
            </div>);
    }
});

var BootstrapContainer = React.createClass({
    getInitialState: function() {
        return {
            previews: [],
            selected: "",
            active: {
                title: "", 
                subtitle: "", 
                authors: [], 
                averageRating: 0,
                publisher: "",
                publishDate: "",
                industryIdentifiers: [{ identifier: "" }]
            }
        };
    },
    repopulateList: function (data) {
        var pending = data.items || [],
            loaded = [], that = this;
        
        function itemLoadHandler(item, data) {
            pending.splice(pending.indexOf(item));
            loaded.push(data);
            if (!pending.length)
                that.setState({ previews: loaded });
        }
        _.each(pending, function (item) {
            $.ajax("https://www.googleapis.com/books/v1/volumes/" + item.id)
            .done(_.partial(itemLoadHandler, item))
            .fail(that.displayError);
        });
    },
    displayError: function (error) {
        console.log("displaying error: " + error);
    },
    searchHandler: function (query) {
        console.log("searching for: " + query);
        this.props.maxResults = this.props.maxResults || 5;
        this.props.startIndex = (this.props.startIndex + this.props.maxResults) || 0;
        $.ajax({
            url: "https://www.googleapis.com/books/v1/volumes",
            dataType: "json",
            data: {
                q: query,
                startIndex: this.props.startIndex,
                maxResults: this.props.maxResults,
            } })
        .done(this.repopulateList)
        .fail(this.displayError);
    },
    onSelect: function (data) {
        this.setState({ 
            selected: "http://books.google.co.il/books?id=" + 
              data.id + "&pg=PP1#v=onepage",
            active: data.volumeInfo
        });
    },
    render: function () {
        return (
            <div className="container-fluid">
              <Header/>
              <PreviewList 
                previews={this.state.previews}
                onSelect={this.onSelect}
                />
              <ContentPane
                searchHandler={this.searchHandler}
                selected={this.state.selected}
                active={this.state.active}
                />
            </div>
        );
    }
});

React.render(<BootstrapContainer/>, $("#container").get(0));
