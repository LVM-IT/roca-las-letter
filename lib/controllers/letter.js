const backend = require('../backend')

const enrichTemplates = (t) => {
  return t.kategorien.map((category) => {
    return {
      id: category.id,
      name: category.name,
      templates: category.vorlagen.map((template) => {
        return {
          id: template.id,
          name: template.name
        }
      })
    }
  })
}

const findTemplateById = (id, t) => {
  let result

  t.kategorien.forEach((category) => {
    category.vorlagen.forEach((template) => {
      if (template.id === id) {
        result = template
      }
    })
  })

  return result
}

const enrichRecipients = (r) => {
  return r.map((recipient, id) => {
    return {
      id: id,
      name: recipient.empfaengerName,
      role: recipient.rolle,
      original: (recipient.original ? 'checked' : '')
    }
  })
}

exports.index = (req, res) => {
  // This is for testing, because the contract IDs are changing
  Promise.all([
    backend.contracts('4711')
  ]).then((result) => {
    res.render('index', {
      contracts: result[0]
    })
  }, (err) => {
    // TODO: Add an error page template
    res.send(`An error occurred: ${err}`)
  })
}

exports.getTemplates = (req, res) => {
  Promise.all([
    backend.templates(req.query.contractId)
  ]).then((result) => {
    res.render('templates', {
      contractId: req.query.contractId,
      partnerId: req.query.partnerId,
      templates: enrichTemplates(result[0])
    })
  }, (err) => {
    // TODO: Add an error page template
    res.send(`An error occurred: ${err}`)
  })
}

exports.getRecipients = (req, res) => {
  Promise.all([
    backend.recipients(req.query.contract),
    backend.templates(req.query.contract)
  ]).then((result) => {
    const templates = result[1]
    const template = findTemplateById(parseInt(req.query.template), templates)

    res.render('recipients', {
      templateId: req.query.template,
      contractId: req.query.contract,
      partnerId: req.query.partner,
      templateName: template.name,
      recipients: enrichRecipients(result[0]),
    })
  }, (err) => {
    // TODO: Add an error page template
    res.send(`An error occurred: ${err}`)
  })
}

exports.send = (req, res) => {
  res.render('send', {
    templateId: parseInt(req.body.template),
    contractId: parseInt(req.body.contract),
    partnerId: parseInt(req.body.partner),
    letters: [
      {
        name: req.body['0-name'],
        target: req.body['0-target'],
        original: (req.body['original'] === '0'),
        copy: (req.body['0-copy'] === 'on'),
      },
      {
        name: req.body['1-name'],
        target: req.body['1-target'],
        original: (req.body['original'] === '1'),
        copy: (req.body['1-copy'] === 'on'),
      }
    ]
  })
}
